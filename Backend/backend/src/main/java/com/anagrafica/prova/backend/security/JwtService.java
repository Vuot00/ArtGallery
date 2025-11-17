package com.anagrafica.prova.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    // Inietta i valori da application.properties
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationMs;

    // Questa è la chiave che useremo per firmare
    private Key key;

    // Questo metodo viene eseguito dopo che il servizio è stato creato e decodifica la chiave segreta da Base64
    @PostConstruct
    public void init() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            this.key = Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            logger.error("Errore durante l'inizializzazione della chiave JWT: {}", e.getMessage());
            // Gestisci l'errore, magari l'app non dovrebbe partire
        }
    }

    // Il metodo principale: generare il token
    public String generateToken(Authentication authentication) {

        // Prendiamo l'utente (l'email) dall'oggetto Authentication
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername(); // (La nostra email)

        //Estraiamo i ruoli e li trasformiamo in una lista di stringhe
        // Esempio risultato: ["ROLE_COLLEZIONISTA", "ROLE_ARTISTA"]
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Costruiamo il token
        return Jwts.builder()
                .setSubject(username) // L'utente (email)
                .claim("roles", roles) // I suoi ruoli
                .setIssuedAt(now) // Data di creazione
                .setExpiration(expiryDate) // Data di scadenza
                .signWith(key, SignatureAlgorithm.HS256) // Firma con la nostra chiave
                .compact(); // Costruisce la stringa
    }

    // --- Metodi futuri ---
    // Questi ci serviranno più avanti per proteggere le API,
    // per ora possiamo lasciarli qui pronti.

    // Estrae l'email (subject) dal token
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Controlla se il token è valido (non scaduto, firma corretta)
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // Gestisce vari tipi di errori (firma non valida, token scaduto, ecc.)
            logger.error("Validazione JWT fallita: {}", e.getMessage());
        }
        return false;
    }
}
