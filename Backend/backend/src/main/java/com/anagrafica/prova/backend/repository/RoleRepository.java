package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    // Metodo per trovare un ruolo tramite il suo nome
    Optional<Role> findByNome(String nome);
}