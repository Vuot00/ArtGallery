import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperaService } from '../../../servizi/opera.service';
import { Opera } from '../../../models/opera.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  private operaService = inject(OperaService);

  // Qui salveremo le opere scaricate dal backend
  opere: Opera[] = [];

  // L'indirizzo base per recuperare le immagini dalla cartella uploads
  // Nota: DEVE finire con lo slash '/'
  backendUrl = 'http://localhost:8080/uploads/';

  ngOnInit() {
    this.caricaDati();
  }

  caricaDati() {
    this.operaService.getOpere().subscribe({
      next: (dati) => {
        console.log("Opere ricevute dal backend:", dati);
        this.opere = dati;
      },
      error: (err) => {
        console.error("Errore nel caricamento:", err);
      }
    });
  }
}
