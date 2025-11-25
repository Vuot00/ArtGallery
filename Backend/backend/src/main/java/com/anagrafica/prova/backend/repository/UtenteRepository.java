package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// gestiamo il caso in cui un utente non abbia id Long
public interface UtenteRepository extends JpaRepository<Utente, Long> {

    Boolean existsByEmail(String email);

    Optional<Utente> findByEmail(String email);

    List<Utente> findByNomeContainingIgnoreCase(String nome);
}