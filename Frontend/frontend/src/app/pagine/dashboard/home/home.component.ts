import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperaService } from '../../../servizi/opera.service';
import { Opera } from '../../../models/opera.model';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  private operaService = inject(OperaService);

  // Qui salveremo le opere scaricate dal backend
  opere: Opera[] = [];

  // Gestione del polling
  private pollingSubscription: Subscription | null = null;

  // L'indirizzo base per recuperare le immagini
  backendUrl = 'http://localhost:8080/uploads/';

  ngOnInit() {
    this.avviaPollingOpere();
  }

  ngOnDestroy() {
    // Importante: fermare il polling quando si cambia pagina
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  avviaPollingOpere() {
    // interval(3000) -> Emette ogni 3 secondi
    // startWith(0) -> Emette subito il primo valore (così non aspetti 3 sec per vedere i dati)
    // switchMap -> Annulla la richiesta precedente se non è finita e ne fa una nuova
    this.pollingSubscription = interval(3000)
        .pipe(
            startWith(0),
            switchMap(() => this.operaService.getOpere())
        )
        .subscribe({
          next: (dati) => {
            // Aggiorniamo la lista. Grazie a trackBy nel HTML,
            // Angular aggiornerà solo i campi cambiati senza sfarfallii.
            this.opere = dati;
            // console.log("Opere aggiornate in background"); // Decommenta per debug
          },
          error: (err) => {
            console.error("Errore nel polling home:", err);
          }
        });
  }

  // Funzione per ottimizzare il rendering della lista:
  // Evita che le immagini vengano ricaricate se l'ID dell'opera non cambia
  trackOpera(index: number, item: Opera): number {
    return <number>item.id;
  }
}
