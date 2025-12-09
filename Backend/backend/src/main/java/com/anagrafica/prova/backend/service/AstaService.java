package com.anagrafica.prova.backend.service;

import com.anagrafica.prova.backend.dto.AstaRequest;
import com.anagrafica.prova.backend.dto.OffertaRequest;
import com.anagrafica.prova.backend.dto.OffertaWebSocketDto;
import com.anagrafica.prova.backend.model.*;
import com.anagrafica.prova.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AstaService {

    @Autowired private OperaRepository operaRepository;
    @Autowired private AstaRepository astaRepository;
    @Autowired private UtenteRepository utenteRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    public Asta getAstaById(Long id) {
        return astaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asta non trovata con ID: " + id));
    }

    @Transactional
    public Asta avviaAsta(Long idOpera, AstaRequest request) {
        Opera opera = operaRepository.findById(idOpera)
                .orElseThrow(() -> new RuntimeException("Opera non trovata"));

        if (opera.getStato() != StatoOpera.DISPONIBILE) {
            throw new RuntimeException("Impossibile avviare asta: l'opera non è disponibile.");
        }

        // Normalizzazione Date
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
        LocalDateTime dataInizioPulita = request.getDataInizio().withSecond(0).withNano(0);
        LocalDateTime dataFinePulita = request.getDataFine().withSecond(0).withNano(0);

        if (dataFinePulita.isBefore(dataInizioPulita)) {
            throw new RuntimeException("La data di fine non può essere precedente alla data di inizio.");
        }

        Asta nuovaAsta = new Asta();
        nuovaAsta.setOpera(opera);
        nuovaAsta.setPrezzoPartenza(request.getPrezzoPartenza());
        nuovaAsta.setPrezzoAttuale(request.getPrezzoPartenza());
        nuovaAsta.setDataInizio(dataInizioPulita);
        nuovaAsta.setDataFine(dataFinePulita);
        nuovaAsta.setMigliorOfferente(null);

        if (dataInizioPulita.isAfter(now)) {
            opera.setStato(StatoOpera.PROGRAMMATA);
        } else {
            opera.setStato(StatoOpera.IN_ASTA);
        }

        operaRepository.save(opera);
        return astaRepository.save(nuovaAsta);
    }

    @Transactional
    public void annullaProgrammazione(Long idAsta) {
        Asta asta = astaRepository.findById(idAsta)
                .orElseThrow(() -> new RuntimeException("Asta non trovata"));

        Opera opera = asta.getOpera();

        if (opera.getStato() != StatoOpera.PROGRAMMATA) {
            throw new RuntimeException("Impossibile annullare: l'asta è già avviata o conclusa.");
        }

        opera.setStato(StatoOpera.DISPONIBILE);
        opera.setAsta(null); 

        operaRepository.save(opera);
        astaRepository.delete(asta);

        System.out.println("🗑️ Asta " + idAsta + " annullata.");
    }

    // --- GESTIONE OFFERTE ---
    @Transactional
    public Asta piazzaOfferta(String emailUtente, OffertaRequest request) {
        Asta asta = astaRepository.findById(request.getIdAsta())
                .orElseThrow(() -> new RuntimeException("Asta non trovata"));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(asta.getDataInizio()) || now.isAfter(asta.getDataFine())) {
            throw new RuntimeException("L'asta non è attiva in questo momento.");
        }

        Double prezzoDaBattere = (asta.getPrezzoAttuale() != null) ? asta.getPrezzoAttuale() : asta.getPrezzoPartenza();

        if (request.getImporto() <= prezzoDaBattere) {
            throw new RuntimeException("L'offerta deve essere superiore a € " + prezzoDaBattere);
        }

        Utente utente = utenteRepository.findByEmail(emailUtente)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        if (now.isAfter(asta.getDataFine().minusMinutes(5))) {
            // Estendi di 5 minuti
            asta.setDataFine(asta.getDataFine().plusMinutes(5));
            System.out.println("Anti-Sniping attivato! Nuova scadenza: " + asta.getDataFine());
        }

        asta.setPrezzoAttuale(request.getImporto());
        asta.setMigliorOfferente(utente);
        astaRepository.save(asta);

        Opera opera = asta.getOpera();
        opera.setPrezzo(request.getImporto());
        operaRepository.save(opera);

        try {
            OffertaWebSocketDto msg = new OffertaWebSocketDto(
                    "OFFERTA",
                    asta.getPrezzoAttuale(),
                    utente.getNome(), // o utente.getEmail()
                    asta.getDataFine()
            );
            messagingTemplate.convertAndSend("/topic/aste/" + asta.getId(), msg);
        } catch (Exception e) {
            System.err.println("Errore invio WebSocket: " + e.getMessage());
        }

        return asta;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void controllaAsteScadute() {
        LocalDateTime now = LocalDateTime.now();
        List<Asta> asteTutte = astaRepository.findAll();

        for (Asta asta : asteTutte) {
            if (asta.getDataFine().isBefore(now) && asta.getOpera().getStato() == StatoOpera.IN_ASTA) {

                System.out.println("🏁 Chiusura automatica asta ID: " + asta.getId());
                Opera opera = asta.getOpera();

                if (asta.getMigliorOfferente() != null) {
                    opera.setStato(StatoOpera.VENDUTA);
                    opera.setPrezzo(asta.getPrezzoAttuale());

                    operaRepository.save(opera);

                    try {
                        String emailVincitore = asta.getMigliorOfferente().getEmail();

                        var msg = new OffertaWebSocketDto("VINCITORE", asta.getPrezzoAttuale(), emailVincitore, null);

                        messagingTemplate.convertAndSend("/topic/aste/" + asta.getId(), msg);
                    } catch (Exception e) {
                        System.err.println("Errore notifica WS: " + e.getMessage());
                    }
                }
                else {
                    System.out.println("🗑️ Asta deserta.");
                    opera.setStato(StatoOpera.DISPONIBILE);
                    operaRepository.save(opera);

                    try {
                        var msg = new OffertaWebSocketDto("CHIUSURA", 0.0, "INVENDUTA", null);
                        messagingTemplate.convertAndSend("/topic/aste/" + asta.getId(), msg);
                    } catch (Exception e) { }

                    astaRepository.delete(asta);
                }
            }
        }
    }
}