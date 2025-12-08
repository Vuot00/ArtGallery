package com.anagrafica.prova.backend.repository;

import com.anagrafica.prova.backend.model.Notifica;
import com.anagrafica.prova.backend.model.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificaRepository extends JpaRepository<Notifica, Long> {
    // Trova le notifiche di un utente ordinate dalla più recente
    List<Notifica> findByDestinatarioOrderByDataCreazioneDesc(Utente destinatario);

    // Conta quante non lette (per il badge rosso)
    long countByDestinatarioAndLettaFalse(Utente destinatario);
}