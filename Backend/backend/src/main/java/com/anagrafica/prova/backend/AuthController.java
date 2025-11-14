package com.anagrafica.prova.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/auth") // come inizieranno tutti gli url
public class AuthController {

    @Autowired
    private UtenteRepository utenteRepository; // salva

    @Autowired
    private PasswordEncoder passwordEncoder; // nasconde la password

    /**
     * registro un nuovo utente
     * ricevo un oggetto utente in formato json dal frontend
     */
    @PostMapping("/registrazione")
    public ResponseEntity<Utente> registraUtente(@RequestBody Utente nuovoUtente) {


        String passwordCriptata = passwordEncoder.encode(nuovoUtente.getPassword());
        nuovoUtente.setPassword(passwordCriptata);


        Utente utenteSalvato = utenteRepository.save(nuovoUtente);


        return ResponseEntity.ok(utenteSalvato);
    }

}