import { Component, OnInit, inject } from '@angular/core';
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


  private router = inject(Router);


  constructor(
    private route: ActivatedRoute,
    private operaService: OperaService,
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
    if (this.opera && this.opera.id) {
      this.router.navigate(['/checkout', this.opera.id]);
    } else {
      alert("Impossibile procedere al checkout: dati opera mancanti.");
    }
  }

  vaiAllAsta() {
    // Reindirizza l'utente alla rotta live dell'asta
    if (this.opera && this.opera.asta?.id) {
      this.router.navigate(['/asta', this.opera.asta.id]);
    } else {
      alert("Asta non ancora attiva.");
    }
  }

  getPrezzoDinamico(): number {
    return this.opera.prezzo || 0;
  }
}
