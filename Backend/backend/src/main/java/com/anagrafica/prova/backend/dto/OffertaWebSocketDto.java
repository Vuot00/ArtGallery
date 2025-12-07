package com.anagrafica.prova.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OffertaWebSocketDto {
    private String tipo;
    private Double importo;
    private String nomeUtente;
}