package com.anagrafica.prova.backend.dto;

import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.Utente;
import java.util.List;

public record SearchResponse(
        List<Utente> utenti,
        List<Opera> opere
) {}
