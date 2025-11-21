package com.anagrafica.prova.backend.dto;
import lombok.Data;

@Data // CREA AUTOMATICAMENTE i metodi get...()
public class ChangePasswordRequest {

    private String vecchiaPassword;
    private String nuovaPassword;
    private String confermaPassword;

}