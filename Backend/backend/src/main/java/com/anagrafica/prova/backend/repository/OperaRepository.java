package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.StatoOpera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OperaRepository extends JpaRepository<Opera, Long> {


    List<Opera> findByTitoloContainingIgnoreCase(String titolo);

    List<Opera> findByArtistaId(Long id);

    List<Opera> findByStatoIsNotOrderByDataCaricamentoDesc(StatoOpera stato);

    @Query("SELECT o FROM Opera o WHERE o.artista.id = :artistaId AND o.stato != 'VENDUTA' ORDER BY o.dataCaricamento DESC")
    List<Opera> findOpereInVendita(@Param("artistaId") Long artistaId);

    List<Opera> findByArtistaIdAndStato(Long artistaId, StatoOpera stato);

}