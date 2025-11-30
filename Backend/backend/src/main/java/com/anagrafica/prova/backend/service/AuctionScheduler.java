package com.anagrafica.prova.backend.service;

import com.anagrafica.prova.backend.model.Asta;
import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.StatoOpera;
import com.anagrafica.prova.backend.repository.AstaRepository;
import com.anagrafica.prova.backend.repository.OperaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuctionScheduler {

    @Autowired private AstaRepository astaRepository;
    @Autowired private OperaRepository operaRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @Scheduled(cron = "0 * * * * *") // Esegue ogni minuto allo scoccare del secondo 00
    @Transactional
    public void gestisciStatiAste() {

        // Prendiamo l'ora attuale precisa al minuto
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        // Aggiungiamo 1 secondo per essere sicuri di includere il minuto corrente nei confronti "<="
        LocalDateTime timeThreshold = now.plusSeconds(1);

        System.out.println("⏰ Scheduler attivo: controllo aste alle " + now);

        // =================================================================================
        // FASE 1: APERTURA ASTE PROGRAMMATE
        // Cerchiamo le aste che sono 'PROGRAMMATA' e la cui dataInizio è passata o è adesso
        // =================================================================================
        List<Asta> asteDaAprire = astaRepository.findAllByDataInizioBeforeAndOpera_Stato(timeThreshold, StatoOpera.PROGRAMMATA);

        for (Asta asta : asteDaAprire) {
            Opera opera = asta.getOpera();

            // 1. Aggiorna DB: L'asta diventa attiva
            opera.setStato(StatoOpera.IN_ASTA);
            operaRepository.save(opera);

            // 2. Notifica WebSocket: APERTURA (Il frontend colorerà il badge di verde)
            Map<String, Object> msgApertura = new HashMap<>();
            msgApertura.put("tipo", "APERTURA");
            msgApertura.put("stato", "IN_ASTA");

            messagingTemplate.convertAndSend("/topic/aste/" + asta.getId(), msgApertura);

            System.out.println("🟢 Asta " + asta.getId() + " APERTA ufficialmente.");
        }

        // =================================================================================
        // FASE 2: CHIUSURA ASTE SCADUTE
        // Cerchiamo le aste che sono 'IN_ASTA' e la cui dataFine è passata o è adesso
        // =================================================================================
        List<Asta> asteScadute = astaRepository.findAllByDataFineBeforeAndOpera_Stato(timeThreshold, StatoOpera.IN_ASTA);

        for (Asta asta : asteScadute) {
            Opera opera = asta.getOpera();

            // Logica di business per decidere lo stato finale
            StatoOpera nuovoStato;
            if (asta.getPrezzoAttuale() > asta.getPrezzoPartenza()) {
                nuovoStato = StatoOpera.VENDUTA;
            } else {
                nuovoStato = StatoOpera.DISPONIBILE; // O INVENDUTA
            }

            // 1. Aggiorna DB
            opera.setStato(nuovoStato);
            operaRepository.save(opera);

            // 2. Notifica WebSocket: CHIUSURA
            Map<String, Object> msgChiusura = new HashMap<>();
            msgChiusura.put("tipo", "CHIUSURA");
            msgChiusura.put("statoFinale", nuovoStato.toString());
            msgChiusura.put("prezzoFinale", asta.getPrezzoAttuale());

            messagingTemplate.convertAndSend("/topic/aste/" + asta.getId(), msgChiusura);

            System.out.println("🔴 Asta " + asta.getId() + " CHIUSA.");
        }
    }
}