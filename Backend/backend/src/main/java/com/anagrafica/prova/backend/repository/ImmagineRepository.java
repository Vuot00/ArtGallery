package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Immagine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface ImmagineRepository extends JpaRepository<Immagine, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Immagine i SET i.opera = NULL WHERE i.opera.id = :idOpera")
    void sganciaImmaginiDaOpera(Long idOpera);
}