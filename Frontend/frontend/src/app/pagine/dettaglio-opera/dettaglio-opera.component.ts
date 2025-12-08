import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { OperaService } from '../../servizi/opera.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

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
  private router = inject(Router);

  constructor(
      private route: ActivatedRoute,
      private operaService: OperaService,
  ) {}

  ngOnInit(): void {
    const idString = this.route.snapshot.paramMap.get('id');

    if (idString) {
      const id = Number(idString);
      this.avviaPolling(id);
    } else {
      this.errore = "ID opera non valido.";
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      console.log("🛑 Polling interrotto");
    }
  }

  avviaPolling(id: number) {
    this.pollingSubscription = interval(5000).pipe(
        startWith(0),
        switchMap(() => this.operaService.getOperaById(id))
    ).subscribe({
      next: (data) => {
        this.aggiornaDati(data);
        this.loading = false;
      },
      error: (err) => {
        console.error("Errore polling:", err);
        if (this.loading) {
          this.errore = "Impossibile caricare i dettagli dell'opera.";
          this.loading = false;
        }
      }
    });
  }

  aggiornaDati(data: any) {
    this.opera = data;
    console.log("🔄 Dati aggiornati:", this.opera);
    if (!this.immagineSelezionata && this.opera.immagini && this.opera.immagini.length > 0) {
      this.immagineSelezionata = this.opera.immagini[0].url;
    }
  }

  cambiaImmaginePrincipale(urlNuovaImmagine: string) {
    this.immagineSelezionata = urlNuovaImmagine;
  }

  getBgImage(nomeFile: string): string {
    return `http://localhost:8080/uploads/${nomeFile}`;
  }

  acquistaOpera() {
    if (this.opera && this.opera.id) {
      this.router.navigate(['/checkout', this.opera.id]);
    } else {
      alert("Impossibile procedere al checkout: dati opera mancanti.");
    }
  }

  vaiAllAsta() {
    if (this.opera && this.opera.asta?.id) {
      this.router.navigate(['/asta', this.opera.asta.id]);
    } else {
      alert("Asta non ancora attiva.");
    }
  }

  getPrezzoDinamico(): number {
    if (this.opera?.asta?.prezzoAttuale) {
      return this.opera.asta.prezzoAttuale;
    }
    return this.opera.prezzo || 0;
  }
}
