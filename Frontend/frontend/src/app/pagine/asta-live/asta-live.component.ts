import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // HttpHeaders non serve più!
import { WebSocketService } from '../../servizi/websocket.service';
import { ToastService } from '../../servizi/toast.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servizi/auth.service';

@Component({
  selector: 'app-asta-live',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './asta-live.component.html',
  styleUrl: './asta-live.component.scss'
})
export class AstaLiveComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private wsService = inject(WebSocketService);
  private toast = inject(ToastService);
  private router = inject(Router);

  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  private wsSubscription: Subscription | null = null;

  asta: any = null;
  idAsta!: number;

  prezzoCorrente: number = 0;
  offertaUtente: number | null = null;
  countdown: string = 'Caricamento...';
  statoAsta: string = 'ATTESA';

  pricePulse: boolean = false;
  timerInterval: any;

  ngOnInit() {
    this.idAsta = Number(this.route.snapshot.paramMap.get('id'));

    // Controllo rapido: se non sei loggato, via al login
    if (!this.authService.isLoggedIn()) {
      this.toast.show("Accesso negato: effettua il login", "error");
      this.router.navigate(['/login']);
      return;
    }

    // 1. Carica i dati statici (REST)
    this.caricaDatiIniziali();

    // 2. Connetti al WebSocket (STOMP)
    // Il WebSocketService usa già il token internamente grazie alla tua modifica 'beforeConnect'
    this.wsSubscription = this.wsService.watchAsta(this.idAsta).subscribe((messaggio: any) => {
      this.ngZone.run(() => {
        console.log('📩 Messaggio WebSocket:', messaggio);

        if (messaggio.tipo === 'CHIUSURA') {
          this.gestisciChiusuraAsta(messaggio);
        } else if (messaggio.importo) {
          this.aggiornaPrezzo(messaggio.importo);
          this.toast.show(`Nuova offerta di € ${messaggio.importo}!`, 'info');
        }
        this.cdr.detectChanges();
      });
    });
  }

  caricaDatiIniziali() {
    // L'AuthInterceptor aggiungerà il token automaticamente

    this.http.get<any>(`http://localhost:8080/api/aste/${this.idAsta}`).subscribe({
      next: (data) => {
        this.asta = data;
        this.prezzoCorrente = data.prezzoAttuale || data.prezzoPartenza;

        if (data.opera.stato === 'VENDUTA' || data.opera.stato === 'DISPONIBILE') {
          this.statoAsta = 'CHIUSA';
          this.countdown = 'Asta Terminata';
        } else {
          this.avviaTimer();
        }

        this.offertaUtente = this.prezzoCorrente + 10;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore caricamento dati:", err);

        if (err.status === 403 || err.status === 401) {
          this.toast.show("Sessione scaduta.", "error");
          this.router.navigate(['/login']);
        } else {
          this.toast.show("Errore caricamento dati asta", "error");
        }
      }
    });
  }

  aggiornaPrezzo(nuovoImporto: number) {
    this.prezzoCorrente = nuovoImporto;
    this.offertaUtente = this.prezzoCorrente + 10;

    // Effetto visivo pulsante
    this.pricePulse = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.pricePulse = false;
      this.cdr.detectChanges();
    }, 500);
  }

  gestisciChiusuraAsta(messaggio: any) {
    this.statoAsta = 'CHIUSA';
    this.countdown = 'Asta Terminata';
    this.prezzoCorrente = messaggio.prezzoFinale;

    if (this.timerInterval) clearInterval(this.timerInterval);

    if (messaggio.statoFinale === 'VENDUTA') {
      this.toast.show('🏆 Asta conclusa! Opera VENDUTA.', 'success');
    } else {
      this.toast.show('🏁 Asta conclusa senza vincitori.', 'error');
    }

    this.cdr.detectChanges();
  }

  inviaOfferta() {
    if (!this.offertaUtente || this.offertaUtente <= this.prezzoCorrente) {
      this.toast.show("L'offerta deve essere superiore al prezzo attuale.", "error");
      return;
    }

    const body = { idAsta: this.idAsta, importo: this.offertaUtente };

    this.http.post('http://localhost:8080/api/offerte', body).subscribe({
      next: () => {
        this.toast.show("Offerta inviata con successo!", "success");
      },
      error: (err) => {
        // Gestione errori specifica del backend (es. "Offerta troppo bassa")
        const msg = err.error ? err.error : "Errore nell'offerta";
        this.toast.show(msg, "error");
      }
    });
  }

  avviaTimer() {
    this.aggiornaStatoTimer();
    this.timerInterval = setInterval(() => {
      this.aggiornaStatoTimer();
    }, 1000);
  }

  aggiornaStatoTimer() {
    if (!this.asta || this.statoAsta === 'CHIUSA') return;

    const now = new Date().getTime();
    const fine = new Date(this.asta.dataFine).getTime();
    const inizio = new Date(this.asta.dataInizio).getTime();

    if (now < inizio) {
      this.statoAsta = 'ATTESA';
      this.countdown = 'L\'asta non è ancora iniziata';
    } else if (now >= inizio && now < fine) {
      this.statoAsta = 'APERTA';
      const diff = fine - now;
      this.countdown = this.formatTime(diff);
    } else {
      this.countdown = 'Chiusura in corso...';
    }
  }

  formatTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}
