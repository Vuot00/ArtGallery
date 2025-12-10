package com.anagrafica.prova.backend.config;

import com.paypal.core.PayPalEnvironment;
import com.paypal.core.PayPalHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
/**
 Questa classe serve a configurare il client di PayPal all'interno del contesto di Spring.
 Invece di istanziare manualmente l'oggetto PayPalHttpClient ogni volta che mi serve (con new),
 lo definisco qui una volta sola e lascio che sia Spring a gestirlo tramite la Dependency Injection.
 **/
@Configuration
public class PayPalConfig {

    /**
     * per un motivo di Sicurezza non scrivo le password o i client-secret direttamente nel codice Java.
     * Li tengo in un file separato che non viene caricato su Git, o che cambia in base all'ambiente."
     *
     * questo mi da piu flessibilità: Se cambio la password, cambio solo il file di testo, non devo ricompilare il codice Java.
     * **/
    @Value("${paypal.client-id}") //Questa annotazione "inietta" dei valori presi da un file di configurazione esterno
    private String clientId;

    @Value("${paypal.client-secret}")
    private String clientSecret;

    @Value("${paypal.mode}")
    private String mode;


    //il codice verifica la variabile mode
    @Bean
    public PayPalHttpClient payPalHttpClient() {
        PayPalEnvironment environment;
        if ("live".equals(mode)) {
            environment = new PayPalEnvironment.Live(clientId, clientSecret);
        } else {
            environment = new PayPalEnvironment.Sandbox(clientId, clientSecret);
        }
        return new PayPalHttpClient(environment);//restituisce un istanza di PayPalHttpClient, che useremo per fare le chiamate vere e proprie
    }
}