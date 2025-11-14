package com.anagrafica.prova.backend; // Assicurati che sia il tuo package

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.springframework.security.config.Customizer.withDefaults; // <-- Import importante!

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // attiviamo la gestione CORS
                .cors(withDefaults())

                .csrf(AbstractHttpConfigurer::disable)

                // regole di autorizzazione
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/test", "/api/auth/registrazione").permitAll()


                        .anyRequest().authenticated()
                );

        return http.build();


    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}