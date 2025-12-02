package com.anagrafica.prova.backend.service;

import com.anagrafica.prova.backend.model.Ordine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(Ordine ordine, String acquirenteEmail) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(acquirenteEmail);
        message.setSubject("✅ Conferma Acquisto Opera: " + ordine.getOpera().getTitolo());
        message.setText("Ciao " + ordine.getAcquirente().getNome() + ",\n\n"
                + "Il tuo acquisto è andato a buon fine! L'opera '" + ordine.getOpera().getTitolo()
                + "' è stata venduta per €" + ordine.getImporto() + ".\n\n"
                + "Stato Ordine: PAGATO. Riceverai i dettagli della spedizione a breve.\n\n"
                + "Grazie per aver acquistato su ArtGallery!");

        mailSender.send(message);
    }
}
