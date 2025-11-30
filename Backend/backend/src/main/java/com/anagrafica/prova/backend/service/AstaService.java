package com.anagrafica.prova.backend.service;

import com.anagrafica.prova.backend.dto.AstaRequest;
import com.anagrafica.prova.backend.model.*;
import com.anagrafica.prova.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AstaService {

    @Autowired private OperaRepository operaRepository;
    @Autowired private AstaRepository astaRepository;

    @Transactional
    public Asta avviaAsta(Long idOpera, AstaRequest request) {

        // Recupera l'opera
        Opera opera = operaRepository.findById(idOpera)
                .orElseThrow(() -> new RuntimeException("Opera non trovata"));

        // Controlli
        if (opera.getStato() != StatoOpera.DISPONIBILE) {
            throw new RuntimeException("Impossibile avviare asta: l'opera è già in asta, programmata o venduta.");
        }

        // Normalizzazione Date (IMPORTANTE)
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        LocalDateTime dataInizioPulita = request.getDataInizio().withSecond(0).withNano(0);
        LocalDateTime dataFinePulita = request.getDataFine().withSecond(0).withNano(0);

        // Controllo validità date
        if (dataFinePulita.isBefore(dataInizioPulita)) {
            throw new RuntimeException("La data di fine non può essere precedente alla data di inizio.");
        }

        // Crea l'oggetto Asta
        Asta nuovaAsta = new Asta();
        nuovaAsta.setOpera(opera);
        nuovaAsta.setPrezzoPartenza(request.getPrezzoPartenza());
        nuovaAsta.setPrezzoAttuale(request.getPrezzoPartenza());

        // Impostiamo le date "pulite"
        nuovaAsta.setDataInizio(dataInizioPulita);
        nuovaAsta.setDataFine(dataFinePulita);

        // LOGICA DECISIONALE DELLO STATO
        if (dataInizioPulita.isAfter(now)) {
            System.out.println("⏳ Asta programmata per il futuro: " + dataInizioPulita);
            opera.setStato(StatoOpera.PROGRAMMATA);
        } else {
            System.out.println("🚀 Asta avviata immediatamente.");
            opera.setStato(StatoOpera.IN_ASTA);
        }

        // Salva tutto
        operaRepository.save(opera);
        return astaRepository.save(nuovaAsta);
    }

    @Transactional
    public void annullaProgrammazione(Long idAsta) {
        Asta asta = astaRepository.findById(idAsta)
                .orElseThrow(() -> new RuntimeException("Asta non trovata"));

        Opera opera = asta.getOpera();

        // Controllo di sicurezza: possiamo annullare solo se è ancora in fase di programmazione
        if (opera.getStato() != StatoOpera.PROGRAMMATA) {
            throw new RuntimeException("Impossibile annullare: l'asta è già avviata o conclusa.");
        }

        // Ripristina lo stato dell'opera a DISPONIBILE
        opera.setStato(StatoOpera.DISPONIBILE);


        opera.setAsta(null);

        // Salviamo l'opera "pulita"
        operaRepository.save(opera);

        // Eliminiamo fisicamente l'asta dal DB
        astaRepository.delete(asta);

        System.out.println("🗑️ Asta programmata " + idAsta + " annullata. Opera tornata DISPONIBILE.");
    }
}