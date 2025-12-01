import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { OperaService } from '../../servizi/opera.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dettaglio-opera',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dettaglio-opera.component.html',
  styleUrl: './dettaglio-opera.component.scss'
})
export class DettaglioOperaComponent implements OnInit, OnDestroy {
  opera: any = null;
  loading: boolean = true;
  errore: string | null = null;
  immagineSelezionata: string | null = null;

  // Variabile per gestire la sottoscrizione al polling
  private pollingSubscription: Subscription | null = null;

  constructor(
      private route: ActivatedRoute,
      private operaService: OperaService,
      private router: Router
  ) {}

  ngOnInit(): void {
    const idString = this.route.snapshot.paramMap.get('id');

    if (idString) {
      const id = Number(idString);
      // Primo caricamento con spinner
      this.caricaDettagliOpera(id);
    } else {
      this.errore = "ID opera non valido.";
      this.loading = false;
    }
  }

  // Importante: distruggere il polling quando si lascia la pagina
  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  caricaDettagliOpera(id: number) {
    this.loading = true;
    this.operaService.getOperaById(id).subscribe({
      next: (data) => {
        this.opera = data;
        this.loading = false;

        // Imposta l'immagine principale solo al primo caricamento
        if (this.opera.immagini && this.opera.immagini.length > 0) {
          this.immagineSelezionata = this.opera.immagini[0].url;
        }

        console.log("Opera caricata:", this.opera);

        // Una volta caricata la prima volta, avvia il controllo periodico
        this.avviaPolling(id);
      },
      error: (err) => {
        console.error("Errore nel caricamento opera:", err);
        this.errore = "Impossibile caricare i dettagli dell'opera. Riprova più tardi.";
        this.loading = false;
      }
    });
  }

  avviaPolling(id: number) {
    // Polling ogni 3 secondi (3000 ms)
    this.pollingSubscription = interval(3000).pipe(
        // switchMap cancella la richiesta precedente se non è ancora finita e ne fa una nuova
        switchMap(() => this.operaService.getOperaById(id))
    ).subscribe({
      next: (data) => {
        // Aggiorniamo i dati dell'opera in tempo reale
        this.opera = data;

        // NOTA: Non reimpostiamo 'immagineSelezionata' qui,
        // per evitare di cambiare l'immagine che l'utente sta guardando
        // se ne ha selezionata una specifica dalla galleria.

        // Se per caso l'immagine selezionata non esiste più nei nuovi dati (raro), fallback
        if (this.immagineSelezionata && this.opera.immagini) {
          const imageExists = this.opera.immagini.some((img: any) => img.url === this.immagineSelezionata);
          if (!imageExists && this.opera.immagini.length > 0) {
            this.immagineSelezionata = this.opera.immagini[0].url;
          }
        }
      },
      error: (err) => {
        // In caso di errore nel polling, logghiamo ma non blocchiamo l'UI
        console.error("Errore aggiornamento silenzioso:", err);
      }
    });
  }

  cambiaImmaginePrincipale(urlNuovaImmagine: string) {
    this.immagineSelezionata = urlNuovaImmagine;
  }

  getBgImage(nomeFile: string): string {
    return `http://localhost:8080/uploads/${nomeFile}`;
  }

  acquistaOpera() {
    alert("Funzionalità di acquisto in arrivo! Contatta l'artista per maggiori info.");
  }

  vaiAllAsta() {
    if (this.opera && this.opera.astaId) {
      this.router.navigate(['/asta', this.opera.astaId]);
    } else {
      // Se l'ID asta non è presente nell'oggetto opera, proviamo a ricaricarlo o logghiamo errore
      console.error("ID Asta non trovato!");
      // Fallback: se siamo in polling potremmo aver appena ricevuto l'astaId
      if(this.opera.asta?.id) {
        this.router.navigate(['/asta', this.opera.asta.id]);
      }
    }
  }
}