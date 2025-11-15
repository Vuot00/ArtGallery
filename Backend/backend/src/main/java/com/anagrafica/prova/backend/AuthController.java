package com.anagrafica.prova.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;


import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/auth") // come inizieranno tutti gli url
public class AuthController {

    @Autowired
    private UtenteRepository utenteRepository; // salva l'utente

    @Autowired
    private RoleRepository roleRepository; // salva il ruolo

    @Autowired
    private PasswordEncoder passwordEncoder; // nasconde la password

    /**
     * registro un nuovo utente
     * ricevo un oggetto utente in formato json dal frontend
     */
    // Assicurati di avere queste dipendenze iniettate nella classe

    @PostMapping("/registrazione")
    public ResponseEntity<?> registraUtente(@RequestBody RegistrationRequest request) {

        // controllo che l'email non sia già in uso
        if (utenteRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Errore: Email già in uso!");
        }

        // creazione nuovo utente
        Utente nuovoUtente = new Utente();
        nuovoUtente.setNome(request.getNome());
        nuovoUtente.setEmail(request.getEmail());

        String passwordCriptata = passwordEncoder.encode(request.getPassword());
        nuovoUtente.setPassword(passwordCriptata);

        Set<Role> ruoli = new HashSet<>();


        Role ruoloCollezionista = roleRepository.findByNome("ROLE_COLLEZIONISTA")
                .orElseThrow(() -> new RuntimeException("Errore: Ruolo ROLE_COLLEZIONISTA non trovato."));
        ruoli.add(ruoloCollezionista);


        if ("ARTISTA".equalsIgnoreCase(request.getTipoUtente())) {
            Role ruoloArtista = roleRepository.findByNome("ROLE_ARTISTA")
                    .orElseThrow(() -> new RuntimeException("Errore: Ruolo ROLE_ARTISTA non trovato."));
            ruoli.add(ruoloArtista);
        }

        nuovoUtente.setRoles(ruoli);

        utenteRepository.save(nuovoUtente);

        return ResponseEntity.ok("Utente registrato con successo!");
    }

}