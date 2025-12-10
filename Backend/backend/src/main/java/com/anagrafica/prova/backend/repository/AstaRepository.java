package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Asta;
import com.anagrafica.prova.backend.model.StatoOpera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AstaRepository extends JpaRepository<Asta, Long> { // specifico l'oggetto e la sua PK
    //Trova tutte le aste attive (dove dataFine è nel futuro)
    //List<Asta> findByDataFineAfter(LocalDateTime now);
    List<Asta> findAllByDataInizioBeforeAndOpera_Stato(LocalDateTime time, StatoOpera stato);
    List<Asta> findAllByDataFineBeforeAndOpera_Stato(LocalDateTime now, StatoOpera stato);
}

/**
 * funge da componente DAO ed è il componente che trasforma le nostre richieste in query sql verso il DB
 */