package com.anagrafica.prova.backend.repository;
import com.anagrafica.prova.backend.model.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import com.anagrafica.prova.backend.model.Ordine;

import java.util.List;

public interface OrdineRepository extends JpaRepository<Ordine, Long> {
    Ordine findByPaypalOrderId(String paypalOrderId);

    List<Ordine> findByAcquirenteOrderByDataCreazioneDesc(Utente acquirente);

}
