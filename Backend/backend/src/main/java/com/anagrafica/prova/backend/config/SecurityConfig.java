package com.anagrafica.prova.backend.config;

import com.anagrafica.prova.backend.security.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.anagrafica.prova.backend.security.JwtAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                /**
                 * csrf(...).disable(): Disabiliti la protezione CSRF (Cross-Site Request Forgery).
                 *
                 * Teoria: Il CSRF serve per le sessioni basate su cookie (stateful). Usiamo i Token JWT
                 * (stateless), quindi il CSRF non serve e anzi, darebbe fastidio.
                 *
                 * formLogin(...).disable(): Disabilitiamo la pagina di login predefinita di Spring.
                 *
                 * httpBasic(...).disable(): Disabilitiamo l'autenticazione base.
                 */
                .cors(withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                /**
                 * Diciamo al server di non ricordare mai l'utente così che ogni operazione richieda
                 * l'autenticazione tramite token jwt
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        // Permette le richieste di "controllo" del browser (CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Permette Login e Registrazione
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers("/api/test").permitAll()

                        .requestMatchers("/uploads/**").permitAll()

                        //.requestMatchers(HttpMethod.GET,"/api/opere/**").permitAll()

                        //Permettiamo l'handshake del WebSockt e senza questo, Spring blocca la connessione prima che possiamo leggere il token dall'URL
                        .requestMatchers("/ws-auction/**").permitAll()

                        // TUTTO IL RESTO RICHIEDE LOGIN
                        .anyRequest().authenticated()
                )

                // usiamo il nostro filtro prima del filtro standard di spring
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        http.authenticationProvider(authenticationProvider());

        return http.build();
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // controlla la correttezza dei dati dell'utente
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // codifica le password per non salvarle in chiaro nel db
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // dicamo al backend di fidarsi delle richiesti provenienti dal frontend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}