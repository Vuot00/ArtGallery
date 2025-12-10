package com.anagrafica.prova.backend.dto;

import lombok.Getter;

@Getter
public class JwtResponse {
    private String token;
    private String type = "Bearer";


    public JwtResponse(String accessToken) {
        this.token = accessToken;
    }
}

/**
 * funziona come lasciapassare iniziale quando viene effettuata l'autenticazione
 * serve per passare le informazioni necessarie per configurare correttamente gli header
 * Authorization
 */