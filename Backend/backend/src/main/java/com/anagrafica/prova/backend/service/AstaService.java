package com.anagrafica.prova.backend.service;

import com.anagrafica.prova.backend.dto.AstaRequest;
import com.anagrafica.prova.backend.model.*;
import com.anagrafica.prova.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AstaService {

    @Autowired private OperaRepository operaRepository;
    @Autowired private AstaRepository astaRepository;

    @Transactional
    public Asta avviaAsta(Long idOpera, AstaRequest request) {

        // Recupera l'opera
        Opera opera = operaRepository.findById(idOpera)
                .orElseThrow(() -> new RuntimeException("Opera non trovata"));

        //Controlli
        if (opera.getStato() != StatoOpera.DISPONIBILE) {
            throw new RuntimeException("Impossibile avviare asta: l'opera è già in asta o venduta.");
        }

        //Crea l'oggetto Asta
        Asta nuovaAsta = new Asta();
        nuovaAsta.setOpera(opera); // Collega l'opera esistente
        nuovaAsta.setPrezzoPartenza(request.getPrezzoPartenza());
        nuovaAsta.setPrezzoAttuale(request.getPrezzoPartenza());
        nuovaAsta.setDataInizio(request.getDataInizio());
        nuovaAsta.setDataFine(request.getDataFine());

        // Cambia lo stato dell'opera (BLOCCO)
        opera.setStato(StatoOpera.IN_ASTA);

        //Salva tutto
        operaRepository.save(opera); // Aggiorna stato
        return astaRepository.save(nuovaAsta); // Crea asta
    }
}