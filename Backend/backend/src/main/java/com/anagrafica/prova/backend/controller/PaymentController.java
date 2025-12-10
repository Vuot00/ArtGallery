package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.Ordine;
import com.anagrafica.prova.backend.model.StatoOpera;
import com.anagrafica.prova.backend.model.Utente;
import com.anagrafica.prova.backend.repository.OperaRepository;
import com.anagrafica.prova.backend.repository.OrdineRepository;
import com.anagrafica.prova.backend.repository.UtenteRepository;
import com.paypal.core.PayPalHttpClient;
import com.paypal.http.HttpResponse;
import com.paypal.orders.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import com.anagrafica.prova.backend.service.EmailService;
import com.anagrafica.prova.backend.service.NotificaService;

/**
 * questo è un REST Controller che gestisce il ciclo di vita del pagamento.
 * Non si limita a parlare con PayPal, ma orchestra anche le conseguenze del pagamento nel nostro sistema:
 * aggiorna il database, invia email e crea notifiche.
 * **/
@RestController
@RequestMapping("/api/pagamenti")
public class PaymentController {

    @Autowired
    private PayPalHttpClient payPalHttpClient;
    @Autowired
    private OrdineRepository ordineRepository;
    @Autowired
    private OperaRepository operaRepository;
    @Autowired
    private UtenteRepository utenteRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private NotificaService notificaService;



    @PostMapping("/create/{idOpera}")
    @Transactional
    public ResponseEntity<?> createOrder(@PathVariable Long idOpera) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName(); //identifico l'utente loggato recuperando la mail dal contesto di sicurezza. Non mi fido di parametri passati dal frontend per l'utente.
            Utente utente = utenteRepository.findByEmail(email).orElseThrow();
            Opera opera = operaRepository.findById(idOpera).orElseThrow();

            // Costruiamo la richiesta per PayPal
            OrderRequest orderRequest = new OrderRequest();
            orderRequest.checkoutPaymentIntent("CAPTURE");

            List<PurchaseUnitRequest> purchaseUnits = new ArrayList<>();
            PurchaseUnitRequest purchaseUnit = new PurchaseUnitRequest()
                    .amountWithBreakdown(new AmountWithBreakdown()
                            .currencyCode("EUR")  //specifichiamo nella richiesta  la valuta , quindi in euro
                            .value(String.valueOf(opera.getPrezzo()))); //specifichiamo anche l importo
            purchaseUnits.add(purchaseUnit);
            orderRequest.purchaseUnits(purchaseUnits);

            OrdersCreateRequest request = new OrdersCreateRequest().requestBody(orderRequest);
            HttpResponse<Order> response = payPalHttpClient.execute(request);
            String paypalOrderId = response.result().id();

            // Salviamo l'ordine "IN_ATTESA" nel nostro DB, legando ò id di paypal a quello del nuovo ordine generato
            Ordine ordine = new Ordine();
            ordine.setAcquirente(utente);
            ordine.setOpera(opera);
            ordine.setImporto(opera.getPrezzo());
            ordine.setStato("IN_ATTESA");
            ordine.setPaypalOrderId(paypalOrderId);
            ordine.setDataCreazione(LocalDateTime.now());
            ordineRepository.save(ordine);

            return ResponseEntity.ok(Collections.singletonMap("id", paypalOrderId));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore creazione ordine: " + e.getMessage());
        }
    }

    @PostMapping("/capture/{paypalOrderId}")
    @Transactional
    public ResponseEntity<?> captureOrder(@PathVariable String paypalOrderId) {
        try {
            // Chiediamo a PayPal di catturare i soldi
            OrdersCaptureRequest request = new OrdersCaptureRequest(paypalOrderId);
            HttpResponse<Order> response = payPalHttpClient.execute(request);

            //Controllo che PayPal risponda con COMPLETED. Solo se i soldi sono stati presi procedo
            if ("COMPLETED".equals(response.result().status())) {
                Ordine ordine = ordineRepository.findByPaypalOrderId(paypalOrderId);
                if (ordine != null) {
                    //Qui aggiorno tutto: l'ordine diventa 'PAGATO' e l'opera diventa 'VENDUTA'. Faccio scattare anche l'invio delle email e le notifiche
                    ordine.setStato("PAGATO");
                    Opera operaVenduta = ordine.getOpera();
                    operaVenduta.setStato(StatoOpera.VENDUTA);
                    operaRepository.save(operaVenduta); // Salva lo stato

                    ordineRepository.save(ordine);
                    emailService.sendOrderConfirmation(ordine, ordine.getAcquirente().getEmail());
                    emailService.sendOrderConfirmationToVenditore(ordine, operaVenduta.getArtista().getEmail());

                    String msgAcquirente = "Hai acquistato con successo l'opera: " + operaVenduta.getTitolo();
                    notificaService.creaNotifica(ordine.getAcquirente(), msgAcquirente);

                    String msgVenditore = "Hai ricevuto un acquisto per l'opera: " + operaVenduta.getTitolo();
                    notificaService.creaNotifica(operaVenduta.getArtista(), msgVenditore);

                    return ResponseEntity.ok("Pagamento completato.");
                }
            }
            return ResponseEntity.badRequest().body("Pagamento non completato.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore cattura: " + e.getMessage());
        }
    }

    //Se l'utente annulla o qualcosa va storto lato client, imposto lo stato dell'ordine su 'ANNULLATO' e mi assicuro che l'opera torni 'DISPONIBILE' per altri acquirenti.
    @PostMapping("/cancel/{paypalOrderId}")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable String paypalOrderId) {
        try {
            Ordine ordine = ordineRepository.findByPaypalOrderId(paypalOrderId);

            if (ordine != null) {
                ordine.setStato("ANNULLATO");
                ordineRepository.save(ordine);

                Opera opera = ordine.getOpera();
                if (opera != null) {
                    opera.setStato(StatoOpera.DISPONIBILE);
                    operaRepository.save(opera);
                }

                return ResponseEntity.ok("Ordine annullato e opera sbloccata.");
            }
            return ResponseEntity.badRequest().body("Ordine non trovato.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore annullamento: " + e.getMessage());
        }
    }
}