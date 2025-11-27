package com.anagrafica.prova.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "aste")
@Data
@NoArgsConstructor
public class Asta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
    private Double prezzoPartenza;
    private Double prezzoAttuale;

    // Relazione 1-a-1: Un'asta riguarda un'opera specifica
    @OneToOne
    @JoinColumn(name = "opera_id", nullable = false, unique = true)
    private Opera opera;

    // Qui metterai la lista delle offerte
    // @OneToMany(mappedBy = "asta")
    // private List<Offerta> offerte;
}