package com.anagrafica.prova.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class TestController {

    /**
     * Questo metodo crea un'API all'indirizzo http://localhost:8080/api/test
     * * @CrossOrigin è la parte FONDAMENTALE.
     * Dice a Spring: "Accetta richieste anche se provengono
     * da http://localhost:4200 (il server di Angular)".
     */
    @GetMapping("/api/test")
    @CrossOrigin(origins = "http://localhost:4200")
    public Map<String, String> getTestMessage() {
        // Restituiamo un oggetto JSON semplice
        return Map.of("messaggio", "Ciao dal TestController! La connessione FUNZIONA.");
    }
}
