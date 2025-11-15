package com.anagrafica.prova.backend.security;

import com.anagrafica.prova.backend.Utente;
import com.anagrafica.prova.backend.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtenteRepository utenteRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Usiamo l'email come username
        Utente utente = utenteRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Utente non trovato con email: " + email));

        // Convertiamo i nostri Ruoli (Role) in GrantedAuthority di Spring
        Set<GrantedAuthority> authorities = utente.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getNome()))
                .collect(Collectors.toSet());

        // Restituiamo un oggetto UserDetails che Spring Security capisce
        return new User(utente.getEmail(), utente.getPassword(), authorities);
    }
}
