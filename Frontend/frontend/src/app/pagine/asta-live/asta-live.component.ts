import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebSocketService } from '../../servizi/websocket.service';
import { ToastService } from '../../servizi/toast.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import {AuthService} from '../../servizi/auth.service';

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
  private pollingSubscription: Subscription | null = null;

  asta: any = null;
  idAsta!: number;
  currentUserEmail: string = '';

  prezzoCorrente: number = 0;
  offertaUtente: number | null = null;
  countdown: string = 'Caricamento...';
  statoAsta: string = 'ATTESA';
  pricePulse: boolean = false;
  timerInterval: any;

  ngOnInit() {
    this.idAsta = Number(this.route.snapshot.paramMap.get('id'));

    const token = localStorage.getItem('jwtToken');

    if (!token) {
      this.toast.show("Accesso negato", "error");
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserEmail = this.getUserEmail(token);
    this.avviaPolling(token);

    this.wsSubscription = this.wsService.watchAsta(this.idAsta).subscribe((messaggio: any) => {
      this.ngZone.run(() => {
        if (messaggio.tipo === 'CHIUSURA' || messaggio.tipo === 'VINCITORE') {
          this.gestisciChiusuraAsta(messaggio);
        }
        else if (messaggio.importo) {

          // Se il messaggio contiene una nuova data di fine (Anti-Sniping)
          if (messaggio.nuovaDataFine) {
            // Aggiorniamo la data dell'oggetto asta locale
            if (this.asta) {
              this.asta.dataFine = messaggio.nuovaDataFine;
              // Ricalcoliamo subito il countdown per mostrare il salto temporale all'utente
              this.aggiornaStatoTimer();
              this.toast.show("Tempo esteso per nuova offerta!", "error");
            }
          }

          this.aggiornaPrezzo(messaggio.importo);
          const chi = messaggio.nomeUtente ? ` da ${messaggio.nomeUtente}` : '';

          if (messaggio.nomeUtente !== this.currentUserEmail) {
            this.toast.show(`Nuova offerta di € ${messaggio.importo}${chi}!`, 'info');
          }
        }
        this.cdr.detectChanges();
      });
    });
  }


  getUserEmail(token: string): string {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      const jsonData = JSON.parse(decoded);
      return jsonData.sub || '';
    } catch (e) {
      console.error("Errore decodifica token", e);
      return '';
    }
  }

  private parseDate(dateInput: any): number {
    if (!dateInput) return 0;

    if (Array.isArray(dateInput)) {
      const d = new Date(
          dateInput[0],      // Anno
          dateInput[1] - 1,  // Mese (JS conta i mesi da 0 a 11)
          dateInput[2],      // Giorno
          dateInput[3] || 0, // Ora
          dateInput[4] || 0, // Minuti
          dateInput[5] || 0  // Secondi
      );
      return d.getTime();
    }

    return new Date(dateInput).getTime();
  }

  avviaPolling(token: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `http://localhost:8080/api/aste/${this.idAsta}`;

    this.pollingSubscription = interval(3000).pipe(
        startWith(0),
        switchMap(() => this.http.get<any>(url, { headers }))
    ).subscribe({
      next: (data) => {
        this.gestisciAggiornamentoDati(data);
      },
      error: (err) => {

        if (err.status === 404) {
          this.gestisciChiusuraAsta({ tipo: 'CHIUSURA', nomeUtente: 'INVENDUTA', importo: this.prezzoCorrente });
          if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
          return;
        }
        if (err.status === 403 || err.status === 401) {
          this.pollingSubscription?.unsubscribe();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  gestisciAggiornamentoDati(data: any) {
    // Controllo se l'asta è finita
    if (data.opera.stato === 'VENDUTA' || data.opera.stato === 'DISPONIBILE' || data.opera.stato === 'INVENDUTA') {
      if (this.statoAsta !== 'CHIUSA') {

        // Verifica se ho vinto tramite polling (fallback)
        if(data.opera.stato === 'VENDUTA' && data.migliorOfferente?.email === this.currentUserEmail) {
          this.toast.show("🎉 HAI VINTO! Reindirizzamento al pagamento...", "success");
          setTimeout(() => {
            this.router.navigate(['/checkout', data.opera.id]);
          }, 2000);
        }

        this.statoAsta = 'CHIUSA';
        this.countdown = 'Asta Terminata';
        this.prezzoCorrente = data.prezzoAttuale || data.prezzoPartenza;

        if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
        if (this.timerInterval) clearInterval(this.timerInterval);
      }
      return;
    }

    this.asta = data;
    const prezzoServer = data.prezzoAttuale || data.prezzoPartenza;

    if (prezzoServer > this.prezzoCorrente) {
      this.prezzoCorrente = prezzoServer;
      this.offertaUtente = this.prezzoCorrente + 10;
    }
    if (!this.timerInterval && this.statoAsta !== 'CHIUSA') this.avviaTimer();

    this.aggiornaStatoTimer();
    this.cdr.detectChanges();
  }

  aggiornaPrezzo(nuovoImporto: number) {
    this.prezzoCorrente = nuovoImporto;
    this.offertaUtente = this.prezzoCorrente;

    // Effetto visivo pulsante
    this.pricePulse = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.pricePulse = false; this.cdr.detectChanges(); }, 500);
  }

  // --- LOGICA CHIUSURA & REDIRECT VINCITORE ---
  gestisciChiusuraAsta(messaggio: any) {
    this.statoAsta = 'CHIUSA';
    this.countdown = 'Asta Terminata';
    this.prezzoCorrente = messaggio.importo || this.prezzoCorrente;

    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.pollingSubscription) this.pollingSubscription.unsubscribe();

    // Caso 1: Asta deserta
    if (messaggio.nomeUtente === 'INVENDUTA') {
      this.toast.show('🏁 Asta conclusa senza vincitori.', 'error');
    }
    // Caso 2: C'è un vincitore
    else if (messaggio.tipo === 'VINCITORE') {
      const emailVincitore = messaggio.nomeUtente;

      if (emailVincitore === this.currentUserEmail) {
        this.toast.show("🎉 COMPLIMENTI! HAI VINTO L'ASTA!", "success");
        this.toast.show("Reindirizzamento al pagamento in 3 secondi...", "info");

        const idOpera = this.asta?.opera?.id;
        if (idOpera) {
          setTimeout(() => {
            this.router.navigate(['/checkout', idOpera]);
          }, 3000);
        }
      } else {
        this.toast.show(`🏆 Asta vinta da un altro utente. Prezzo finale: € ${this.prezzoCorrente}`, 'info');
      }
    }
    this.cdr.detectChanges();
  }

  inviaOfferta() {
    if (!this.offertaUtente || this.offertaUtente <= this.prezzoCorrente) {
      this.toast.show("L'offerta deve essere superiore al prezzo attuale.", "error");
      return;
    }

    const token = localStorage.getItem('jwtToken');

    // IMPORTANTE: responseType 'text' per evitare errori di parsing JSON
    const opzioni = {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
      responseType: 'text' as 'json'
    };

    const body = { idAsta: this.idAsta, importo: this.offertaUtente };

    this.http.post('http://localhost:8080/api/aste/offerta', body, opzioni)
        .subscribe({
          next: (res: any) => {
            this.toast.show(res, "success");
            // Aggiornamento ottimistico
            if (this.offertaUtente) this.aggiornaPrezzo(this.offertaUtente);
          },
          error: (err) => {
            console.error(err);
            let msg = "Errore offerta";
            if(typeof err.error === 'string') msg = err.error;
            else if(err.error?.message) msg = err.error.message;
            this.toast.show(msg, "error");
          }
        });
  }

  avviaTimer() {
    this.aggiornaStatoTimer();
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.aggiornaStatoTimer();
    }, 1000);
  }

  aggiornaStatoTimer() {
    if (!this.asta || this.statoAsta === 'CHIUSA') return;

    const now = new Date().getTime();
    const fine = this.parseDate(this.asta.dataFine);
    const inizio = this.parseDate(this.asta.dataInizio);

    if (now < inizio) {
      if (this.statoAsta !== 'ATTESA') this.statoAsta = 'ATTESA';
      this.countdown = 'L\'asta non è ancora iniziata';
    }
    else if (now >= inizio && now < fine) {
      if (this.statoAsta !== 'APERTA') this.statoAsta = 'APERTA';
      const diff = fine - now;
      this.countdown = this.formatTime(diff);
    }
    else {
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
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
  }
}
