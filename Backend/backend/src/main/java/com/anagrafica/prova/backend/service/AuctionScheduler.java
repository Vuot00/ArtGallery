package com.anagrafica.prova.backend.service;

import com.anagrafica.prova.backend.model.Asta;
import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.StatoOpera;
import com.anagrafica.prova.backend.repository.AstaRepository;
import com.anagrafica.prova.backend.repository.OperaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate; // <--- IMPORTANTE
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

    @Scheduled(fixedRate = 60000) // Ogni minuto
    @Transactional
    public void controllaScadenzaAste() {
        LocalDateTime now = LocalDateTime.now();

        // Trova aste scadute ma ancora segnate come IN_ASTA
        List<Asta> asteScadute = astaRepository.findAllByDataFineBeforeAndOpera_Stato(now, StatoOpera.IN_ASTA);

        for (Asta asta : asteScadute) {
            Opera opera = asta.getOpera();

            // Logica di business per decidere lo stato
            StatoOpera nuovoStato;
            if (asta.getPrezzoAttuale() > asta.getPrezzoPartenza()) {
                nuovoStato = StatoOpera.VENDUTA;
            } else {
                nuovoStato = StatoOpera.DISPONIBILE;
            }

            // 1. Aggiorna DB
            opera.setStato(nuovoStato);
            operaRepository.save(opera);

            // 2. INVIA NOTIFICA WEBSOCKET ISTANTANEA
            // Creiamo un oggetto semplice (Map) per dire al frontend cosa è successo
            Map<String, Object> messaggioChiusura = new HashMap<>();
            messaggioChiusura.put("tipo", "CHIUSURA"); // "Tag" per distinguere dalle offerte
            messaggioChiusura.put("statoFinale", nuovoStato.toString());
            messaggioChiusura.put("prezzoFinale", asta.getPrezzoAttuale());

            // Spedisci sul canale specifico dell'asta
            messagingTemplate.convertAndSend("/topic/aste/" + asta.getId(), messaggioChiusura);

            System.out.println("🔴 Asta chiusa e notifica inviata per ID: " + asta.getId());
        }
    }
}