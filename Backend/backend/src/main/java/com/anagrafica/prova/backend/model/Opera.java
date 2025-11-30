package com.anagrafica.prova.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "opere")
@Data
@NoArgsConstructor
public class Opera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titolo;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String descrizione;

    private Double prezzo;

    @Enumerated(EnumType.STRING)
    private StatoOpera stato = StatoOpera.DISPONIBILE;

    @OneToMany(mappedBy = "opera", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Immagine> immagini = new ArrayList<>();

    private LocalDateTime dataCaricamento;

    @ManyToOne
    @JoinColumn(name = "artista_id")
    private Utente artista;

    public Opera(String titolo, String descrizione, Double prezzo, LocalDateTime anno, Utente artista) {
        this.titolo = titolo;
        this.descrizione = descrizione;
        this.prezzo = prezzo;
        this.dataCaricamento = anno;
        this.artista = artista;
    }

    // --- MODIFICA FONDAMENTALE ---
    // 1. Rinominato in 'asta' per matchare il frontend (opera.asta.id)
    // 2. Usato JsonIgnoreProperties invece di JsonIgnore per inviare i dati senza loop
    @OneToOne(mappedBy = "opera")
    @JsonIgnoreProperties("opera")
    private Asta asta;
}