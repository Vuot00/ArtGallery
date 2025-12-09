package com.anagrafica.prova.backend.controller;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Cattura l'errore e fa uscire un messaggio che avvisa l'utente
     */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<String> handleConcurrencyFailure(OptimisticLockingFailureException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Attenzione: Il prezzo è cambiato mentre stavi facendo l'offerta. Aggiorna la pagina e riprova.");
    }
}