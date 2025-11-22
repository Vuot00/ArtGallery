package com.anagrafica.prova.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "opere")
@Data
public class Opera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titolo;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String descrizione;
    private Double prezzo;


    @OneToMany(mappedBy = "opera", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Immagine> immagini = new ArrayList<>();

    private LocalDateTime dataCaricamento;


    @ManyToOne
    @JoinColumn(name = "artista_id")
    private Utente artista;
}