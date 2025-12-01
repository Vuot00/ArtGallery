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
      this.caricaDettagliOpera(id);
    } else {
      this.errore = "ID opera non valido.";
      this.loading = false;
    }
  }

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

        if (this.opera.immagini && this.opera.immagini.length > 0) {
          this.immagineSelezionata = this.opera.immagini[0].url;
        }

        console.log("Opera caricata:", this.opera);
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
    this.pollingSubscription = interval(3000).pipe(
        switchMap(() => this.operaService.getOperaById(id))
    ).subscribe({
      next: (data) => {
        this.opera = data;
        if (this.immagineSelezionata && this.opera.immagini) {
          const imageExists = this.opera.immagini.some((img: any) => img.url === this.immagineSelezionata);
          if (!imageExists && this.opera.immagini.length > 0) {
            this.immagineSelezionata = this.opera.immagini[0].url;
          }
        }
      },
      error: (err) => {
        console.error("Errore aggiornamento silenzioso:", err);
      }
    });
  }

  getPrezzoDinamico(): number {
    if (!this.opera) return 0;
    if (this.opera.stato === 'PROGRAMMATA' && this.opera.asta) {
      return this.opera.asta.prezzoPartenza;
    }
    if (this.opera.stato === 'IN_ASTA' && this.opera.asta) {
      return this.opera.asta.prezzoAttuale || this.opera.asta.prezzoPartenza;
    }
    return this.opera.prezzo;
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

  // MODIFICA QUI: Logica migliorata per trovare l'ID dell'asta
  vaiAllAsta() {
    // Cerchiamo l'ID sia nell'oggetto 'asta' nidificato, sia come proprietà diretta 'astaId'
    const idAsta = this.opera?.asta?.id || this.opera?.astaId;

    if (idAsta) {
      this.router.navigate(['/asta', idAsta]);
    } else {
      console.error("ID Asta non trovato nei dati dell'opera:", this.opera);
      alert("Impossibile trovare l'asta associata a quest'opera.");
    }
  }
}