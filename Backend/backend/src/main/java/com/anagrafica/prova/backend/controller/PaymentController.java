package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.Ordine;
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

    // 1. AVVIA IL PAGAMENTO
    @PostMapping("/create/{idOpera}")
    @Transactional
    public ResponseEntity<?> createOrder(@PathVariable Long idOpera) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Utente utente = utenteRepository.findByEmail(email).orElseThrow();
            Opera opera = operaRepository.findById(idOpera).orElseThrow();

            // Costruiamo la richiesta per PayPal
            OrderRequest orderRequest = new OrderRequest();
            orderRequest.checkoutPaymentIntent("CAPTURE");

            List<PurchaseUnitRequest> purchaseUnits = new ArrayList<>();
            PurchaseUnitRequest purchaseUnit = new PurchaseUnitRequest()
                    .amountWithBreakdown(new AmountWithBreakdown()
                            .currencyCode("EUR")
                            .value(String.valueOf(opera.getPrezzo())));
            purchaseUnits.add(purchaseUnit);
            orderRequest.purchaseUnits(purchaseUnits);

            // Chiamiamo PayPal
            OrdersCreateRequest request = new OrdersCreateRequest().requestBody(orderRequest);
            HttpResponse<Order> response = payPalHttpClient.execute(request);
            String paypalOrderId = response.result().id();

            // Salviamo l'ordine "IN_ATTESA" nel nostro DB
            Ordine ordine = new Ordine();
            ordine.setAcquirente(utente);
            ordine.setOpera(opera);
            ordine.setImporto(opera.getPrezzo());
            ordine.setStato("IN_ATTESA");
            ordine.setPaypalOrderId(paypalOrderId);
            ordine.setDataCreazione(LocalDateTime.now());
            ordineRepository.save(ordine);

            // Restituiamo l'ID di PayPal al frontend
            return ResponseEntity.ok(Collections.singletonMap("id", paypalOrderId));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore creazione ordine: " + e.getMessage());
        }
    }

    // 2. COMPLETA IL PAGAMENTO (Dopo che l'utente ha pagato nel popup)
    @PostMapping("/capture/{paypalOrderId}")
    @Transactional
    public ResponseEntity<?> captureOrder(@PathVariable String paypalOrderId) {
        try {
            // Chiediamo a PayPal di catturare i soldi
            OrdersCaptureRequest request = new OrdersCaptureRequest(paypalOrderId);
            HttpResponse<Order> response = payPalHttpClient.execute(request);

            if ("COMPLETED".equals(response.result().status())) {
                Ordine ordine = ordineRepository.findByPaypalOrderId(paypalOrderId);
                if (ordine != null) {
                    ordine.setStato("PAGATO");
                    Opera operaVenduta = ordine.getOpera();
                    operaVenduta.setVenduta(true);
                    operaRepository.save(operaVenduta); // Salva lo stato

                    ordineRepository.save(ordine);
                    emailService.sendOrderConfirmation(ordine, ordine.getAcquirente().getEmail());
                    return ResponseEntity.ok("Pagamento completato.");
                }
            }
            return ResponseEntity.badRequest().body("Pagamento non completato.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore cattura: " + e.getMessage());
        }
    }
}