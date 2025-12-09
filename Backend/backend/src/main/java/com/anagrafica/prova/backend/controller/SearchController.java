package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.dto.SearchResponse;
import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.Utente;
import com.anagrafica.prova.backend.repository.OperaRepository;
import com.anagrafica.prova.backend.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private OperaRepository operaRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @GetMapping("/global")
    public ResponseEntity<SearchResponse> searchGlobal(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) { // vengono mostrati potenziali risultati quando la ricerca ha almeno 2 caratteri
            return ResponseEntity.ok(new SearchResponse(List.of(), List.of()));
        }

        // 1. Cerca Utenti (Artisti/Collezionisti)
        List<Utente> utenti = utenteRepository.findByNomeContainingIgnoreCase(query);
        /** Pulizia sicurezza: nascondi password
         * quando restituiamo un utente come risultato della ricerca stiamo restituendo un oggetto utente che
         * è un'entità jpa e che contiene anche i campi sensibili come password, con questo impostiamo a null i
         * campi che vogliamo nascondere
         */
        utenti.forEach(u -> { u.setPassword(null); u.setRoles(null); });
        // 2. Cerca Opere
        List<Opera> opere = operaRepository.findByTitoloContainingIgnoreCase(query);

        return ResponseEntity.ok(new SearchResponse(utenti, opere));
    }
}
