import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { AuthService } from '../../servizi/auth.service';
import { UserService } from '../../servizi/user.service';
import { ToastService } from '../../servizi/toast.service';
import { OperaService } from '../../servizi/opera.service';
import { WebSocketService } from '../../servizi/websocket.service';

// Components
import { AvviaAstaComponent } from '../artista/avvia-asta/avvia-asta.component';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AvviaAstaComponent],
  templateUrl: './profilo.component.html',
  styleUrl: './profilo.component.scss'
})
export class ProfiloComponent implements OnInit, OnDestroy {

  // Dependency Injection
  private userService = inject(UserService);
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private operaService = inject(OperaService);
  private webSocketService = inject(WebSocketService);

  // Stato UI
  activeTab: any = 'dati';
  isArtist: boolean = false;
  showAstaModal = false;
  selectedOperaId: number | null = null;

  // Gestione Timer e Sottoscrizioni
  private timerRefreshId: any; // Riferimento al timer per poterlo cancellare
  private wsSubscriptions: Subscription[] = [];

  // Dati
  utente: any = {};
  mieOpere: any[] = [];
  acquisti: any[] = [];
  vendite: any[] = [];

  passData = {
    vecchiaPassword: '',
    nuovaPassword: '',
    confermaPassword: ''
  };

  ngOnInit() {
    this.isArtist = this.authService.isArtist();
    this.caricaProfilo();

    if (this.isArtist) {
      // 1. Caricamento iniziale immediato
      this.caricaMieOpere();

      // 2. Avvio la sincronizzazione con l'orologio di sistema
      this.sincronizzaRefreshConOrologio();
    }
  }

  ngOnDestroy() {
    // Pulizia fondamentale per evitare memory leaks
    if (this.timerRefreshId) {
      clearTimeout(this.timerRefreshId);
    }
    this.chiudiConnessioniWebSocket();
  }

  // ----------------------------------------------------------------
  // LOGICA DI SINCRONIZZAZIONE OROLOGIO (Clock Sync)
  // ----------------------------------------------------------------
  sincronizzaRefreshConOrologio() {
    const now = new Date();

    // Calcoliamo quanti millisecondi mancano al prossimo minuto esatto (es. hh:mm:00)
    // 60000 ms - (secondi attuali * 1000 + millisecondi attuali)
    const msAlProssimoMinuto = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    // Aggiungiamo un piccolo buffer (es. 100ms) per essere sicuri di essere entrati nel nuovo minuto
    const delay = msAlProssimoMinuto + 100;

    console.log(`⏳ Prossimo refresh schedulato tra ${delay} ms (al minuto esatto)`);

    this.timerRefreshId = setTimeout(() => {
      console.log('⏰ Scoccare del minuto! Eseguo refresh fallback.');

      // Eseguiamo il refresh dei dati
      this.caricaMieOpere();

      // Rilanciamo la funzione per pianificare il minuto successivo
      // Usiamo ricorsione invece di setInterval per evitare deriva temporale (drift)
      this.sincronizzaRefreshConOrologio();

    }, delay);
  }

  // ----------------------------------------------------------------
  // GESTIONE DATI E WEBSOCKET
  // ----------------------------------------------------------------

  caricaProfilo() {
    this.userService.getProfilo().subscribe({
      next: (res) => this.utente = res,
      error: (err) => console.error('Errore caricamento profilo:', err)
    });
  }

  caricaMieOpere() {
    const email = this.authService.getEmail();
    const token = localStorage.getItem('jwtToken');

    if (email && token) {
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.get(`http://localhost:8080/api/opere/artista/${email}`, { headers })
          .subscribe({
            next: (res: any) => {
              this.mieOpere = res;
              // Ogni volta che ricarico la lista, riattivo l'ascolto real-time
              this.attivaAscoltoRealTime();
            },
            error: (err) => console.error('Errore caricamento opere:', err)
          });
    }
  }

  attivaAscoltoRealTime() {
    // 1. Chiudi vecchie sottoscrizioni per non avere duplicati
    this.chiudiConnessioniWebSocket();

    // 2. Itera sulle opere e collegati a quelle IN_ASTA
    this.mieOpere.forEach(opera => {
      // IMPORTANTE: Adatta 'opera.asta?.id' alla struttura del tuo JSON
      // Se il backend restituisce l'id asta dentro l'oggetto opera, usalo.
      const idAsta = opera.asta?.id;

      if (opera.stato === 'IN_ASTA' && idAsta) {

        const sub = this.webSocketService.watchAsta(idAsta).subscribe((messaggio: any) => {

          if (messaggio.tipo === 'CHIUSURA') {
            console.log(`⚡ WebSocket Update: Asta ${idAsta} chiusa -> ${messaggio.statoFinale}`);

            // Aggiornamento immediato della UI senza aspettare il minuto
            opera.stato = messaggio.statoFinale;
            if (messaggio.prezzoFinale) {
              opera.prezzo = messaggio.prezzoFinale;
            }

            this.toastService.show(`Asta conclusa: ${opera.titolo}`, 'info');
          }
        });

        this.wsSubscriptions.push(sub);
      }
    });
  }

  chiudiConnessioniWebSocket() {
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());
    this.wsSubscriptions = [];
  }

  // ----------------------------------------------------------------
  // ALTRE AZIONI UTENTE
  // ----------------------------------------------------------------

  eliminaOpera(id: number) {
    if (confirm("Sei sicuro di voler eliminare definitivamente questa opera?")) {
      this.operaService.eliminaOpera(id).subscribe({
        next: () => {
          this.mieOpere = this.mieOpere.filter(o => o.id !== id);
          this.toastService.show("Opera eliminata con successo!", "success");
        },
        error: (err) => this.toastService.show("Errore eliminazione", "error")
      });
    }
  }

  salvaDati() {
    this.userService.updateProfilo(this.utente).subscribe({
      next: () => {
        this.toastService.show('Profilo aggiornato!', 'success');
        this.authService.updateNameManual(this.utente.nome);
      },
      error: () => this.toastService.show('Errore aggiornamento', 'error'),
    });
  }

  cambiaPassword() {
    if (this.passData.nuovaPassword !== this.passData.confermaPassword) {
      this.toastService.show('Le password non coincidono!', 'error');
      return;
    }
    this.http.post('http://localhost:8080/api/utente/me/password', this.passData).subscribe({
      next: () => {
        this.toastService.show('Password cambiata!', 'success');
        this.authService.logout();
      },
      error: () => this.toastService.show('Errore cambio password', 'error'),
    });
  }

  openAstaModal(id: number) {
    this.selectedOperaId = id;
    this.showAstaModal = true;
  }

  closeModal() {
    this.showAstaModal = false;
    this.selectedOperaId = null;
  }

  refreshList() {
    this.closeModal();
    this.caricaMieOpere();
  }
}