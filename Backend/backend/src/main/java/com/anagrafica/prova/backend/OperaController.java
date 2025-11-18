package com.anagrafica.prova.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder; // <--- Importante!
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/opere")
public class OperaController {

    @Autowired
    private OperaRepository operaRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    // Cartella dove salvare le immagini (nella root del progetto backend)
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> caricaOpera(
            @RequestParam("titolo") String titolo,
            @RequestParam("descrizione") String descrizione,
            @RequestParam("prezzo") Double prezzo,
            @RequestParam("file") MultipartFile file

    ) {
        try {

            String emailArtista = SecurityContextHolder.getContext().getAuthentication().getName();


            Utente artista = utenteRepository.findByEmail(emailArtista)
                    .orElseThrow(() -> new RuntimeException("Utente non trovato con email: " + emailArtista));


            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();


            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }


            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);


            Opera nuovaOpera = new Opera();
            nuovaOpera.setTitolo(titolo);
            nuovaOpera.setDescrizione(descrizione);
            nuovaOpera.setPrezzo(prezzo);
            nuovaOpera.setImmagineUrl(fileName);
            nuovaOpera.setDataCaricamento(LocalDateTime.now());
            nuovaOpera.setArtista(artista);

            operaRepository.save(nuovaOpera);

            return ResponseEntity.ok("Opera caricata con successo!");

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Errore nel salvataggio del file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore generico: " + e.getMessage());
        }
    }
}