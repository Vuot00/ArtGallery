package com.anagrafica.prova.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "opere")
@Data
public class Opera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titolo;
    private String descrizione;
    private Double prezzo;


    private String immagineUrl;

    private LocalDateTime dataCaricamento;


    @ManyToOne
    @JoinColumn(name = "artista_id")
    private Utente artista;
}