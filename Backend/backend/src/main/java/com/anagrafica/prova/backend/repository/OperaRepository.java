package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OperaRepository extends JpaRepository<Opera, Long> {

    List<Opera> findByTitoloContainingIgnoreCase(String titolo);

    List<Opera> findByArtistaId(Long id);

    List<Opera> findByVendutaFalseOrderByDataCaricamentoDesc();

    @Query("SELECT o FROM Opera o WHERE o.artista.id = :artistaId AND o.venduta = false")
    List<Opera> findOpereInVendita(@Param("artistaId") Long artistaId);

    List<Opera> findByArtistaIdAndVendutaTrue(Long artistaId);

}