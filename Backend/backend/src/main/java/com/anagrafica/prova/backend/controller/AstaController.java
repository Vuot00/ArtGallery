package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.dto.AstaRequest;
import com.anagrafica.prova.backend.model.Asta;
import com.anagrafica.prova.backend.service.AstaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/aste")
public class AstaController {

    @Autowired private AstaService astaService;

    @PostMapping("/avvia/{idOpera}")
    public ResponseEntity<?> avviaAsta(@PathVariable Long idOpera, @RequestBody AstaRequest request) {
        try {
            if (request.getDataFine().isBefore(request.getDataInizio())) {
                return ResponseEntity.badRequest().body("Date non valide");
            }
            Asta asta = astaService.avviaAsta(idOpera, request);
            return ResponseEntity.ok(asta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @DeleteMapping("/{id}/annulla")
    public ResponseEntity<?> annullaAsta(@PathVariable Long id) {
        try {
            astaService.annullaProgrammazione(id);
            return ResponseEntity.ok("Programmazione annullata con successo. L'opera è tornata disponibile.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore durante l'annullamento: " + e.getMessage());
        }
    }
}