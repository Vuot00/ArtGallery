package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.dto.JwtResponse;
import com.anagrafica.prova.backend.dto.LoginRequest;
import com.anagrafica.prova.backend.dto.RegistrationRequest;
import com.anagrafica.prova.backend.model.Role;
import com.anagrafica.prova.backend.model.Utente;
import com.anagrafica.prova.backend.repository.RoleRepository;
import com.anagrafica.prova.backend.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.anagrafica.prova.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;


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

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    /**
     * registro un nuovo utente
     * ricevo un oggetto utente in formato json dal frontend
     */

    @PostMapping("/registrazione")
    public ResponseEntity<?> registraUtente(@RequestBody RegistrationRequest request) {

        // controllo per far si che l'email non sia già in uso
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

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        // Esegui l'autenticazione
        // Spring Security usa il nostro CustomUserDetailsService e PasswordEncoder
        // Se email o pass sono errati, lancerà un'eccezione (gestita da Spring)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Se l'autenticazione ha successo, genera il token
        String jwt = jwtService.generateToken(authentication);


        return ResponseEntity.ok(new JwtResponse(jwt));
    }
}