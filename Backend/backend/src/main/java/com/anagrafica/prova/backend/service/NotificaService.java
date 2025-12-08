package com.anagrafica.prova.backend.service;

import com.anagrafica.prova.backend.model.Notifica;
import com.anagrafica.prova.backend.model.Utente;
import com.anagrafica.prova.backend.repository.NotificaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificaService {

    @Autowired
    private NotificaRepository notificaRepository;

    public void creaNotifica(Utente utente, String messaggio) {
        Notifica n = new Notifica(utente, messaggio);
        notificaRepository.save(n);
    }

    public List<Notifica> getNotificheUtente(Utente utente) {
        return notificaRepository.findByDestinatarioOrderByDataCreazioneDesc(utente);
    }

    public void segnaTutteComeLette(Utente utente) {
        List<Notifica> list = notificaRepository.findByDestinatarioOrderByDataCreazioneDesc(utente);
        for(Notifica n : list) {
            n.setLetta(true);
        }
        notificaRepository.saveAll(list);
    }
}
