package com.anagrafica.prova.backend;

import org.springframework.data.jpa.repository.JpaRepository;

// gestiamo il caso in cui un utente non abbia id Long
public interface UtenteRepository extends JpaRepository<Utente, Long> {



}