package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Immagine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImmagineRepository extends JpaRepository<Immagine, Long> {
}
