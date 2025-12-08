package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.dto.ChangePasswordRequest;
import com.anagrafica.prova.backend.model.StatoOpera;
import com.anagrafica.prova.backend.model.Utente;
import com.anagrafica.prova.backend.repository.OperaRepository;
import com.anagrafica.prova.backend.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import com.anagrafica.prova.backend.repository.OrdineRepository;

@RestController
@RequestMapping("/api/utente")
public class UtenteController {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OrdineRepository ordineRepository;

    @Autowired
    private OperaRepository operaRepository;

    //Metodo che Recupera l'utente loggato dal Token
    private Utente getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utenteRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfilo() {
        Utente me = getMe();
        // Per sicurezza, non mandiamo mai la password al frontend, nemmeno criptata
        me.setPassword(null);
        return ResponseEntity.ok(me);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfilo(@RequestBody Utente nuoviDati) {
        Utente me = getMe();
        // Aggiorna solo i campi permessi
        me.setNome(nuoviDati.getNome());
        // quando avremo gli altri campi (cognome, bio, telefono), li aggiorneremo qui.
        utenteRepository.save(me);

        // Restituiamo un JSON
        return ResponseEntity.ok(Collections.singletonMap("message", "Profilo aggiornato con successo!"));
    }

   //cambio password
    @PostMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Utente me = getMe();
        if (!passwordEncoder.matches(request.getVecchiaPassword(), me.getPassword())) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "La vecchia password non è corretta."));
        }

        if (!request.getNuovaPassword().equals(request.getConfermaPassword())) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Le nuove password non coincidono."));
        }

        me.setPassword(passwordEncoder.encode(request.getNuovaPassword()));
        utenteRepository.save(me);

        return ResponseEntity.ok(Collections.singletonMap("message", "Password modificata con successo!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfiloPubblico(@PathVariable Long id) {
        return utenteRepository.findById(id)
                .map(u -> {
                    u.setPassword(null); // Nascondi password
                   // u.setRoles(null);    // Nascondi ruoli tecnici
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/acquisti")
    public ResponseEntity<?> getMieiAcquisti() {
        Utente me = getMe();
        return ResponseEntity.ok(ordineRepository.findByAcquirenteOrderByDataCreazioneDesc(me));
    }

    @GetMapping("/vendite")
    public ResponseEntity<?> getMieVendite() {
        Utente me = getMe();
        return ResponseEntity.ok(operaRepository.findByArtistaIdAndStato(me.getId(), StatoOpera.VENDUTA));    }
}