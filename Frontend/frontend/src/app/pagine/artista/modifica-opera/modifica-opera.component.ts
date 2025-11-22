import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OperaService } from '../../../servizi/opera.service';

@Component({
  selector: 'app-modifica-opera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifica-opera.component.html',
  styleUrl: './modifica-opera.component.scss'
})
export class ModificaOperaComponent implements OnInit {

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

    this.idOpera = Number(this.route.snapshot.paramMap.get('id'));

    this.operaService.getOperaById(this.idOpera).subscribe({
      next: (opera) => {
        this.datiOpera = opera;
        this.loading = false;
      },
      error: (err) => {
        alert('Errore nel caricamento opera');
        this.router.navigate(['/profilo']);
      }
    });
  }

  salvaModifiche() {
    const datiDaInviare = {
      titolo: this.datiOpera.titolo,
      descrizione: this.datiOpera.descrizione,
      prezzo: this.datiOpera.prezzo
    };

    this.operaService.modificaOpera(this.idOpera, datiDaInviare).subscribe({
      next: () => {
        alert('Opera modificata con successo!');
        this.router.navigate(['/profilo']);
      },
      error: (err) => {
        console.error("DETTAGLI ERRORE:", err);
        alert('Errore: ' + (err.error || 'Errore sconosciuto'));
      }
    });
  }

  eliminaImmagine(idImg: number) {
    if(!confirm("Vuoi eliminare questa foto?")) return;

    this.operaService.eliminaFoto(idImg).subscribe(() => {
      this.datiOpera.immagini = this.datiOpera.immagini.filter((img: any) => img.id !== idImg);
    });
  }

  uploadNuovaFoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.operaService.aggiungiFoto(this.idOpera, file).subscribe((nuovaImg) => {

        this.datiOpera.immagini.push(nuovaImg);
        alert("Foto aggiunta!");
      });
    }
  }

  annulla() {
    this.router.navigate(['/profilo']);
  }
}
