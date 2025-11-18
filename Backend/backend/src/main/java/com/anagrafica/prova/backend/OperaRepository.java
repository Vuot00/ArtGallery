package com.anagrafica.prova.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OperaRepository extends JpaRepository<Opera, Long> {

    List<Opera> findByEmail(Utente email);
}