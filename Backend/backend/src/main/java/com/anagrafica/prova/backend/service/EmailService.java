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

    public  void sendOrderConfirmationToVenditore(Ordine ordine, String venditoreEmail) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(venditoreEmail);
        message.setSubject("✅ Acquisto Opera: " + ordine.getOpera().getTitolo());
        message.setText("Ciao " + ordine.getOpera().getArtista().getNome() + ",\n\n"
                + "Hai ricevuto un acquisto per l'opera '" + ordine.getOpera().getTitolo()
                + "' per €" + ordine.getImporto() + ".\n\n"
                + "Stato Ordine: PAGATO. Riceverai i dettagli della spedizione a breve.\n\n"
                + "Grazie per aver acquistato su ArtGallery!");

        mailSender.send(message);
    }
}
