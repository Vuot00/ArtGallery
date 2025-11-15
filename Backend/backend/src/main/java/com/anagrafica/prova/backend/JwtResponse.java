package com.anagrafica.prova.backend;

import lombok.Getter;

@Getter
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    // Puoi aggiungere altri dati qui, come il nome utente o i ruoli
    // private String nome;
    // private List<String> roles;

    public JwtResponse(String accessToken) {
        this.token = accessToken;
    }
}