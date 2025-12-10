import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { OperaService } from '../../../servizi/opera.service';
import { ToastService } from '../../../servizi/toast.service';

@Component({
  selector: 'app-modifica-opera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifica-opera.component.html',
  styleUrl: './modifica-opera.component.scss'
})
export class ModificaOperaComponent implements OnInit {

  toastService = inject(ToastService);

  idOpera!: number;
  datiOpera: any = {
    titolo: '',
    descrizione: '',
    prezzo: null
  };
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private operaService: OperaService
  ) {}

  ngOnInit(): void {
    // recuperiamo l'opera da modificare tramite l'id e mostro tutti i dati da poter modificare
    this.idOpera = Number(this.route.snapshot.paramMap.get('id'));

    this.operaService.getOperaById(this.idOpera).subscribe({
      next: (opera) => {
        this.datiOpera = opera;
        this.loading = false;
      },
      error: (err) => {
        this.toastService.show("Errore nel caricamento opera", "error");
        this.router.navigate(['/profilo']);
      }
    });
  }

  salvaModifiche() {
    const datiDaInviare = { // è un dto semplice per salvare i nuovi dati
      titolo: this.datiOpera.titolo,
      descrizione: this.datiOpera.descrizione,
      prezzo: this.datiOpera.prezzo
    };

    this.operaService.modificaOpera(this.idOpera, datiDaInviare).subscribe({
      next: () => {
        this.toastService.show("Opera modificata con successo!", "success");
        this.router.navigate(['/profilo']);
      },
      error: (err) => {
        console.error("DETTAGLI ERRORE:", err);
        this.toastService.show("Errore ",(err.error || 'Errore sconosciuto'));
      }
    });
  }

  eliminaImmagine(idImg: number) {
    // ci assicuriamo che nell'eliminazione delle immagini non vengano rimosse tutte (opera senza immagini)
    if (this.datiOpera.immagini && this.datiOpera.immagini.length <= 1) {
      this.toastService.show("Impossibile eliminare: L'opera deve avere almeno una foto!", "error");
      return;
    }
    if(!confirm("Vuoi eliminare questa foto?")) return;

    this.operaService.eliminaFoto(idImg).subscribe({
      next: () => {
        this.datiOpera.immagini = this.datiOpera.immagini.filter((img: any) => img.id !== idImg);
        this.toastService.show("Foto eliminata con successo!", "success");
      },
      error: (err) => {
        this.toastService.show("Errore durante l'eliminazione", "error");
      }
    });
  }

  // ogni nuova immagine caricata viene "pushata" e mostrata all'utente
  uploadNuovaFoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.operaService.aggiungiFoto(this.idOpera, file).subscribe((nuovaImg) => {

        this.datiOpera.immagini.push(nuovaImg);
        this.toastService.show("Foto caricata con successo!", "success");
      });
    }
  }

  annulla() {
    this.router.navigate(['/profilo']);
  }
}
