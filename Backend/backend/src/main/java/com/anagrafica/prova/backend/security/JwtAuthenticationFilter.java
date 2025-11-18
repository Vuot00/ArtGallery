package com.anagrafica.prova.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        System.out.println("--> DEBUG JWT FILTER: Header ricevuto: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("--> DEBUG JWT FILTER: Header assente o senza Bearer");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = authHeader.substring(7);
            String userEmail = jwtService.getUsernameFromToken(jwt);

            System.out.println("--> DEBUG JWT FILTER: Email nel token: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.customUserDetailsService.loadUserByUsername(userEmail);

                if (jwtService.validateToken(jwt)) {
                    System.out.println("--> DEBUG JWT FILTER: Token VALIDO. Utente autenticato!");
                    // ... qui c'è il codice che setta l'autenticazione ...
                } else {
                    System.out.println("--> DEBUG JWT FILTER: Token NON valido!");
                }
            }
        } catch (Exception e) {
            System.out.println("--> DEBUG JWT FILTER: Eccezione! " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}