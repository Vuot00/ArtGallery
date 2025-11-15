package com.anagrafica.prova.backend;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationRequest {
    private String nome;
    private String email;
    private String password;
    private String tipoUtente; // Sarà "ARTISTA" o "COLLEZIONISTA"
}