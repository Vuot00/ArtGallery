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
import { AstaService } from '../../servizi/asta.service'; // <--- 1. IMPORT NECESSARIO

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
  private astaService = inject(AstaService); // <--- 2. INIEZIONE SERVICE

  // Stato UI
  activeTab: any = 'dati';
  isArtist: boolean = false;
  showAstaModal = false;
  selectedOperaId: number | null = null;

  // Gestione Timer e Sottoscrizioni
  private timerRefreshId: any;
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
    this.caricaAcquisti(); // Chiamata per tutti gli utenti

    if (this.isArtist) {
      this.caricaMieOpere();
      this.caricaVendite(); // <--- AGGIUNTO da feature/paypal
      this.sincronizzaRefreshConOrologio(); // <--- AGGIUNTO da HEAD
    }
  }

  ngOnDestroy() {
    if (this.timerRefreshId) {
      clearTimeout(this.timerRefreshId);
    }
    this.chiudiConnessioniWebSocket();
  }

  // ----------------------------------------------------------------
  // LOGICA DI SINCRONIZZAZIONE OROLOGIO
  // ----------------------------------------------------------------
  sincronizzaRefreshConOrologio() {
    const now = new Date();
    const msAlProssimoMinuto = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    const delay = msAlProssimoMinuto + 100;

    console.log(`⏳ Prossimo refresh schedulato tra ${delay} ms`);

    this.timerRefreshId = setTimeout(() => {
      console.log('⏰ Scoccare del minuto! Eseguo refresh fallback.');
      this.caricaMieOpere();
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
            this.attivaAscoltoRealTime();
          },
          error: (err) => console.error('Errore caricamento opere:', err)
        });
    }
  }

  // Nuova funzione per caricare le vendite (da feature/paypal)
  caricaVendite() {
    this.userService.getVendite().subscribe(res => {
      console.log("VENDITE SCARICATE:", res);
      this.vendite = res;
    });
  }

  // Funzione per caricare gli acquisti (unificata)
  caricaAcquisti() {
    this.userService.getAcquisti().subscribe({
      next: (res) => {
        console.log("ACQUISTI SCARICATI:", res);
        this.acquisti = res;
      },
      error: (err) => console.error("Errore acquisti:", err)
    });
  }

  attivaAscoltoRealTime() {
    this.chiudiConnessioniWebSocket();

    this.mieOpere.forEach(opera => {
      const idAsta = opera.asta?.id;

      // Ascoltiamo sia se è IN_ASTA sia se è PROGRAMMATA
      if ((opera.stato === 'IN_ASTA' || opera.stato === 'PROGRAMMATA') && idAsta) {

        const sub = this.webSocketService.watchAsta(idAsta).subscribe((messaggio: any) => {

          // CASO 1: CHIUSURA ASTA
          if (messaggio.tipo === 'CHIUSURA') {
            console.log(`⚡ Asta Chiusa: ${messaggio.statoFinale}`);
            opera.stato = messaggio.statoFinale;
            if (messaggio.prezzoFinale) opera.prezzo = messaggio.prezzoFinale;
            this.toastService.show(`Asta conclusa: ${opera.titolo}`, 'info');
          }

          // CASO 2: APERTURA ASTA (Da Programmata a In Asta)
          if (messaggio.tipo === 'APERTURA') {
            console.log(`🟢 Asta Aperta!`);
            opera.stato = 'IN_ASTA';
            this.toastService.show(`L'asta per "${opera.titolo}" è iniziata!`, 'success');
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
  // AZIONI UTENTE
  // ----------------------------------------------------------------

  annullaProgrammazione(opera: any) {
    const idAsta = opera.asta?.id;

    if (!idAsta) {
      this.toastService.show("Errore: ID Asta non trovato", "error");
      return;
    }

    if (confirm(`Vuoi annullare la programmazione per "${opera.titolo}"? L'opera tornerà disponibile.`)) {
      this.astaService.annullaAsta(idAsta).subscribe({
        next: () => {
          this.toastService.show("Programmazione annullata con successo!", "success");

          opera.stato = 'DISPONIBILE';
          opera.asta = null;

        },
        error: (err) => {
          console.error(err);
          this.toastService.show("Errore durante l'annullamento", "error");
        }
      });
    }
  }

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

  // ----------------------------------------------------------------
  // GESTIONE MODAL ASTA (da HEAD)
  // ----------------------------------------------------------------
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
    this.caricaVendite(); // Potrebbe essersi aggiunta una vendita, quindi aggiorniamo anche questo
  }
}
