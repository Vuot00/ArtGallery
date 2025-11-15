package com.anagrafica.prova.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// gestiamo il caso in cui un utente non abbia id Long
public interface UtenteRepository extends JpaRepository<Utente, Long> {

    Boolean existsByEmail(String email);

    Optional<Utente> findByEmail(String email);


}