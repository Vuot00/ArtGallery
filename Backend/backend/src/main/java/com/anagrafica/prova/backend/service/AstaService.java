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

        // 1. Recupera l'opera
        Opera opera = operaRepository.findById(idOpera)
                .orElseThrow(() -> new RuntimeException("Opera non trovata"));

        // 2. Controlli
        if (opera.getStato() != StatoOpera.DISPONIBILE) {
            throw new RuntimeException("Impossibile avviare asta: l'opera è già in asta, programmata o venduta.");
        }

        // 3. Normalizzazione Date (IMPORTANTE)
        // Tronchiamo i secondi a 0 per allinearci con lo Scheduler che scatta al secondo :00.
        // Se non lo fai, un'asta creata alle 17:45:30 rischierebbe di non aprirsi alle 17:45:00.
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        LocalDateTime dataInizioPulita = request.getDataInizio().withSecond(0).withNano(0);
        LocalDateTime dataFinePulita = request.getDataFine().withSecond(0).withNano(0);

        // Controllo validità date
        if (dataFinePulita.isBefore(dataInizioPulita)) {
            throw new RuntimeException("La data di fine non può essere precedente alla data di inizio.");
        }

        // 4. Crea l'oggetto Asta
        Asta nuovaAsta = new Asta();
        nuovaAsta.setOpera(opera);
        nuovaAsta.setPrezzoPartenza(request.getPrezzoPartenza());
        nuovaAsta.setPrezzoAttuale(request.getPrezzoPartenza());

        // Impostiamo le date "pulite"
        nuovaAsta.setDataInizio(dataInizioPulita);
        nuovaAsta.setDataFine(dataFinePulita);

        // 5. LOGICA DECISIONALE DELLO STATO (Modifica Chiave)
        if (dataInizioPulita.isAfter(now)) {
            // Se la data di inizio è nel futuro (es. Inizio 17:45, Adesso 17:43)
            // Impostiamo lo stato di attesa.
            System.out.println("⏳ Asta programmata per il futuro: " + dataInizioPulita);
            opera.setStato(StatoOpera.PROGRAMMATA);
        } else {
            // Se la data è adesso o nel passato (es. Inizio 17:43, Adesso 17:43 o 17:44)
            // L'asta parte immediatamente.
            System.out.println("🚀 Asta avviata immediatamente.");
            opera.setStato(StatoOpera.IN_ASTA);
        }

        // 6. Salva tutto
        operaRepository.save(opera); // Salva lo stato (PROGRAMMATA o IN_ASTA)
        return astaRepository.save(nuovaAsta); // Salva l'asta
    }
}