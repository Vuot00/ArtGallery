package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OperaRepository extends JpaRepository<Opera, Long> {

    //List<Opera> findByEmail(Utente email); era sbagliato questo
    List<Opera> findByArtista(Utente artista);
    List<Opera> findAllByOrderByDataCaricamentoDesc();
}