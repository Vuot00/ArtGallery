package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.model.Notifica;
import com.anagrafica.prova.backend.model.Utente;
import com.anagrafica.prova.backend.repository.UtenteRepository;
import com.anagrafica.prova.backend.service.NotificaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifiche")
public class NotificaController {

    @Autowired private NotificaService notificaService;
    @Autowired private UtenteRepository utenteRepository;

    private Utente getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utenteRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public List<Notifica> getMieNotifiche() {
        return notificaService.getNotificheUtente(getMe());
    }

    @PostMapping("/leggi-tutte")
    public void leggiTutte() {
        notificaService.segnaTutteComeLette(getMe());
    }
}