package com.anagrafica.prova.backend;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "utenti")
@Getter
@Setter
@NoArgsConstructor // crea il costruttore vuoto, serve JPA
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String nome;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    @JoinTable(
            name = "utenti_ruoli", // Nome della tabella "ponte"
            joinColumns = @JoinColumn(name = "utente_id"), // Colonna che si riferisce a Utente
            inverseJoinColumns = @JoinColumn(name = "role_id") // Colonna che si riferisce a Role
    )
    private Set<Role> roles = new HashSet<>();

}