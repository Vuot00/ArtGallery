package com.anagrafica.prova.backend; // Assicurati che sia il tuo package

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults; // <-- Import importante!

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Attiviamo la gestione CORS di Spring Security
                .cors(withDefaults())

                // 2. Disabilitiamo CSRF (non serve per le API JSON)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Definiamo le regole di autorizzazione
                .authorizeHttpRequests(auth -> auth
                        // Permettiamo a CHIUNQUE di accedere
                        // al nostro endpoint di test.
                        .requestMatchers("/api/test").permitAll()

                        // Per tutte le ALTRE richieste, l'utente
                        // deve essere autenticato.
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}