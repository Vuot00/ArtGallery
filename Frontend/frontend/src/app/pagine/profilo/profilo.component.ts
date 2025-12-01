import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servizi/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {UserService} from '../../servizi/user.service';
import { ToastService } from '../../servizi/toast.service';
import { OperaService } from '../../servizi/opera.service';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profilo.component.html',
  styleUrl: './profilo.component.scss'
})
export class ProfiloComponent implements OnInit {

  private userService = inject(UserService);
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private operaService = inject(OperaService);


  // Stato
  activeTab: any = 'dati'; // Tab attiva di default
  isArtist: boolean = false;

  // Dati
  utente: any = {};
  mieOpere: any[] = []; // Opere caricate (reali)
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
    this.caricaAcquisti();


    if (this.isArtist) {
      this.caricaMieOpere();
      this.caricaVendite();
    }
  }

  caricaProfilo() {
    this.userService.getProfilo().subscribe({
      next: (res) => this.utente = res,
      error: (err) => console.error('Errore caricamento profilo:', err)
    });
  }

  eliminaOpera(id: number) {
    if (confirm("Sei sicuro di voler eliminare definitivamente questa opera?")) {

      this.operaService.eliminaOpera(id).subscribe({
        next: () => {
          // Rimuoviamo l'opera dalla lista locale per vederla sparire subito
          this.mieOpere = this.mieOpere.filter(o => o.id !== id);
          this.toastService.show("Opera eliminata con successo!", "success");
        },
        error: (err) => {
          console.error(err);
          this.toastService.show("Errore nell'eliminazione dell'opera", "error");
        }
      });
    }
  }

  caricaMieOpere() {
    const email = this.authService.getEmail();
    const token = localStorage.getItem('jwtToken');

    if (email && token) {
      // Inseriamo il token nell'header per autorizzare la richiesta
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get(`http://localhost:8080/api/opere/artista/${email}`, { headers })
        .subscribe({
          next: (res: any) => this.mieOpere = res,
          error: (err) => console.error('Errore caricamento opere:', err)
        });
    } else {
      console.error('Impossibile caricare le opere: Dati utente mancanti.');
    }
  }

  salvaDati() {
    this.userService.updateProfilo(this.utente).subscribe({
      next: () =>{
        this.toastService.show('Profilo aggiornato con successo!', 'success');
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
        this.toastService.show('Password cambiata con successo!', 'success');
        this.authService.logout(); // Logout forzato per sicurezza
      },
      error: (err) => this.toastService.show('Errore cambio password', 'error'),
    });
  }

  caricaVendite() {
    this.userService.getVendite().subscribe(res => {
      console.log("VENDITE SCARICATE:", res); // <--- VEDI QUESTO LOG?
      this.vendite = res;
    });
  }

  caricaAcquisti() {
    this.userService.getAcquisti().subscribe({
      next: (res) => {
        console.log("ACQUISTI SCARICATI:", res); // Debug
        this.acquisti = res;
      },
      error: (err) => console.error("Errore acquisti:", err)
    });
  }
}
