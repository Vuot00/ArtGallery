package com.anagrafica.prova.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "ordini")
public class Ordine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utente_id")
    private Utente acquirente;

    @ManyToOne
    @JoinColumn(name = "opera_id")
    private Opera opera;

    private Double importo;

    // ID dell'ordine lato PayPal (es. "5A329...")
    private String paypalOrderId;

    private String stato; // "IN_ATTESA", "PAGATO", "FALLITO"

    private LocalDateTime dataCreazione;
}