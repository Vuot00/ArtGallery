import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AstaService } from '../../../servizi/asta.service';
import { ToastService } from '../../../servizi/toast.service';

@Component({
  selector: 'app-avvia-asta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avvia-asta.component.html',
  styleUrl: './avvia-asta.component.scss'
})
export class AvviaAstaComponent {

  @Input() operaId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() auctionStarted = new EventEmitter<void>();

  private astaService = inject(AstaService);
  private toastService = inject(ToastService);

  // Dati del form
  form = {
    prezzoPartenza: 0,
    dataInizio: '',
    dataFine: ''
  };

  isLoading = false;

  conferma() {
    if (this.form.prezzoPartenza <= 0 || !this.form.dataInizio || !this.form.dataFine) {
      this.toastService.show("Compila tutti i campi correttamente.", "error");
      return;
    }

    /* Controllo validità date lato frontend (UX), serve per dare feedback immediato all'utente, ma comunque
    viene fatto un controllo anche da parte del backend per sicurezza
     */
    if (new Date(this.form.dataFine) <= new Date(this.form.dataInizio)) {
      this.toastService.show("La data di fine deve essere successiva all'inizio.", "error");
      return;
    }

    this.isLoading = true;

    this.astaService.avviaAsta(this.operaId, this.form).subscribe({
      next: (res) => {
        this.toastService.show("Asta avviata con successo!", "success");
        this.isLoading = false;
        this.auctionStarted.emit(); // Avvisa il padre
        this.close.emit(); // Chiudi modale
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Errore: " + (err.error || "Impossibile avviare asta"), "error");
        this.isLoading = false;
      }
    });
  }

  annulla() {
    this.close.emit();
  }
}


/**
 * È il componente che gestisce il form di creazione di un'asta. Riceve in Input l'ID dell'opera
 * da mettere all'asta. Quando l'utente conferma, esegue una validazione preliminare delle date
 * lato client e poi invoca AstaService per chiamare l'API REST. Usa gli Output (EventEmitter) per
 * notificare al componente padre l'esito dell'operazione (chiusura modale o successo dell'avvio),
 * permettendo al frontend di aggiornarsi in modo reattivo.
 */