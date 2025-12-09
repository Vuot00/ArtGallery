package com.anagrafica.prova.backend.controller;

import com.anagrafica.prova.backend.model.Immagine;
import com.anagrafica.prova.backend.model.Opera;
import com.anagrafica.prova.backend.model.StatoOpera;
import com.anagrafica.prova.backend.repository.ImmagineRepository;
import com.anagrafica.prova.backend.repository.OperaRepository;
import com.anagrafica.prova.backend.model.Utente;
import com.anagrafica.prova.backend.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/opere")
public class OperaController {

    @Autowired
    protected OperaRepository operaRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private ImmagineRepository immagineRepository;

    // Cartella dove salvare le immagini (nella root del progetto backend)
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> caricaOpera(
            @RequestParam("titolo") String titolo,
            @RequestParam("descrizione") String descrizione,
            @RequestParam("prezzo") Double prezzo,
            @RequestParam("files") MultipartFile[] files
    ) {
        try {
            String emailArtista = SecurityContextHolder.getContext().getAuthentication().getName();
            Utente artista = utenteRepository.findByEmail(emailArtista)
                    .orElseThrow(() -> new RuntimeException("Utente non trovato"));

            Opera nuovaOpera = new Opera();
            nuovaOpera.setTitolo(titolo);
            nuovaOpera.setDescrizione(descrizione);
            nuovaOpera.setPrezzo(prezzo);
            nuovaOpera.setDataCaricamento(LocalDateTime.now());
            nuovaOpera.setArtista(artista);

            // Gestione Cartella
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            // Ciclo su ogni file caricato
            for (MultipartFile file : files) {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), uploadPath.resolve(fileName));

                Immagine img = new Immagine();
                img.setUrl(fileName);
                img.setOpera(nuovaOpera);
                nuovaOpera.getImmagini().add(img);
            }

            operaRepository.save(nuovaOpera);
            return ResponseEntity.ok("Opera con " + files.length + " immagini caricata!");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}/immagini", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> aggiungiImmagine(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            Opera opera = operaRepository.findById(id).orElseThrow(() -> new RuntimeException("Opera non trovata"));

            // anche in aggiorna ed elimina si assicura che eventuali modifiche siano permesse solo al proprietario dell'opera
            String emailCorrente = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!opera.getArtista().getEmail().equals(emailCorrente)) {
                return ResponseEntity.status(403).body("Non autorizzato");
            }


            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), Paths.get(UPLOAD_DIR).resolve(fileName));


            Immagine img = new Immagine();
            img.setUrl(fileName);
            img.setOpera(opera);

            immagineRepository.save(img);

            return ResponseEntity.ok(img);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore upload: " + e.getMessage());
        }
    }

    @DeleteMapping("/immagini/{idImmagine}")
    public ResponseEntity<?> eliminaImmagine(@PathVariable Long idImmagine) {
        try {
            Immagine img = immagineRepository.findById(idImmagine)
                    .orElseThrow(() -> new RuntimeException("Immagine non trovata"));


            String emailCorrente = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!img.getOpera().getArtista().getEmail().equals(emailCorrente)) {
                return ResponseEntity.status(403).body("Non autorizzato");
            }


            try { Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(img.getUrl())); } catch (Exception ignored) {}

            immagineRepository.delete(img);
            return ResponseEntity.ok("Immagine eliminata");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore eliminazione");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminaOpera(@PathVariable Long id) {
        try {

            String emailArtista = SecurityContextHolder.getContext().getAuthentication().getName();

            Opera opera = operaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Opera non trovata"));

            if (!opera.getArtista().getEmail().equals(emailArtista)) {
                return ResponseEntity.status(403).body("Non hai il permesso di eliminare questa opera!");
            }

            operaRepository.delete(opera);

            return ResponseEntity.ok("Opera eliminata con successo.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore durante l'eliminazione: " + e.getMessage());
        }
    }


    @GetMapping("/artista/{email}")
    public ResponseEntity<?> getOpereByArtista(@PathVariable String email) {
        try {
            Utente artista = utenteRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utente non trovato"));

            return ResponseEntity.ok(operaRepository.findOpereInVendita(artista.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOperaById(@PathVariable Long id) {
        try {
            Opera opera = operaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Opera non trovata"));


            return ResponseEntity.ok(opera);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Opera non trovata");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> aggiornaOpera(@PathVariable Long id, @RequestBody Opera operaAggiornata) {
        try {
            String emailCorrente = SecurityContextHolder.getContext().getAuthentication().getName();


            Opera opera = operaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Opera non trovata"));


            if (!opera.getArtista().getEmail().equals(emailCorrente)) {
                return ResponseEntity.status(403).body("Non puoi modificare opere non tue!");
            }

            opera.setTitolo(operaAggiornata.getTitolo());
            opera.setDescrizione(operaAggiornata.getDescrizione());
            opera.setPrezzo(operaAggiornata.getPrezzo());


            operaRepository.save(opera);

            return ResponseEntity.ok("Opera aggiornata con successo!");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore aggiornamento: " + e.getMessage());
        }
    }

    // RECUPERARER TUTTE LE OPERE (Per la homepage)+ordinarle per ordine di caricamento(dallapiu recente alla piu vecchia)
    @GetMapping
    public ResponseEntity<List<Opera>> getAllOpere() {
        return ResponseEntity.ok(operaRepository.findByStatoIsNotOrderByDataCaricamentoDesc(StatoOpera.VENDUTA));
    }
    @GetMapping("/artista/id/{id}")
    public ResponseEntity<?> getOpereByArtistaId(@PathVariable Long id) {
        return ResponseEntity.ok(operaRepository.findByArtistaId(id));
    }



}