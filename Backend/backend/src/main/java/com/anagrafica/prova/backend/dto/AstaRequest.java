package com.anagrafica.prova.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AstaRequest {
    private Double prezzoPartenza;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
}

/**
 * questo come tutti i DTO serve per disaccoppiare lo strato di presentazione dallo stato di
 * presistenza, il client può inviare solo i dati definiti qui, gli altri che fanno riferimento all'entità
 * (in questo caso l'oggetto asta) sono manipolati internamente
 */