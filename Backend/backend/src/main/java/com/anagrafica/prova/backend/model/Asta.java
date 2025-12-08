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

    @OneToOne
    @JoinColumn(name = "opera_id", nullable = false, unique = true)
    private Opera opera;

    @ManyToOne
    @JoinColumn(name = "miglior_offerente_id")
    private Utente migliorOfferente;

}