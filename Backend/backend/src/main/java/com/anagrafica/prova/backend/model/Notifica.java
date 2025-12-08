package com.anagrafica.prova.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notifica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String messaggio;
    private LocalDateTime dataCreazione;
    private boolean letta; // true se l'utente l'ha vista/cliccata

    @ManyToOne
    @JoinColumn(name = "utente_id")
    private Utente destinatario; // Chi riceve la notifica

    // Costruttori, Getter e Setter
    public Notifica() {}

    public Notifica(Utente destinatario, String messaggio) {
        this.destinatario = destinatario;
        this.messaggio = messaggio;
        this.dataCreazione = LocalDateTime.now();
        this.letta = false;
    }

    // Aggiungi qui tutti i Getter e Setter standard...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessaggio() { return messaggio; }
    public void setMessaggio(String messaggio) { this.messaggio = messaggio; }
    public LocalDateTime getDataCreazione() { return dataCreazione; }
    public void setDataCreazione(LocalDateTime dataCreazione) { this.dataCreazione = dataCreazione; }
    public boolean isLetta() { return letta; }
    public void setLetta(boolean letta) { this.letta = letta; }
    public Utente getDestinatario() { return destinatario; }
    public void setDestinatario(Utente destinatario) { this.destinatario = destinatario; }
}