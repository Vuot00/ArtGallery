package com.anagrafica.prova.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AstaRequest {
    private Double prezzoPartenza;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
}