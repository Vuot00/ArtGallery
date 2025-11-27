import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { OperaService } from '../../servizi/opera.service';

@Component({
  selector: 'app-dettaglio-opera',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dettaglio-opera.component.html',
  styleUrl: './dettaglio-opera.component.scss'
})
export class DettaglioOperaComponent implements OnInit {
  opera: any = null;
  loading: boolean = true;
  errore: string | null = null;
  immagineSelezionata: string | null = null;

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
      },
      error: (err) => {
        console.error("Errore nel caricamento opera:", err);
        this.errore = "Impossibile caricare i dettagli dell'opera. Riprova più tardi.";
        this.loading = false;
      }
    });
  }

  cambiaImmaginePrincipale(urlNuovaImmagine: string) {
    this.immagineSelezionata = urlNuovaImmagine;
  }

  // Funzione helper per ottenere l'URL completo dell'immagine
  getBgImage(nomeFile: string): string {
    return `http://localhost:8080/uploads/${nomeFile}`;
  }

  acquistaOpera() {
    // Qui andrebbe la logica di integrazione con Stripe, PayPal, etc.

    alert("Funzionalità di acquisto in arrivo! Contatta l'artista per maggiori info.");
  }

  vaiAllAsta() {
    if (this.opera && this.opera.astaId) {
      this.router.navigate(['/asta', this.opera.astaId]);
    } else {
      console.error("ID Asta non trovato!");
    }
  }

}
