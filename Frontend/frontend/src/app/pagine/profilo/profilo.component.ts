import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servizi/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import {UserService} from '../../servizi/user.service';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profilo.component.html',
  styleUrl: './profilo.component.scss'
})
export class ProfiloComponent implements OnInit {

  private userService = inject(UserService);
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);


  // Stato
  activeTab: string = 'dati'; // Tab attiva di default
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

    if (this.isArtist) {
      this.caricaMieOpere();
    }
  }

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
      next: () => alert('Profilo aggiornato!'),
      error: () => alert('Errore aggiornamento.')
    });
  }

  aggiornaDati() {
    this.http.put('http://localhost:8080/api/utente/me', this.utente).subscribe({
      next: () => alert('Dati aggiornati!'),
      error: () => alert('Errore aggiornamento')
    });
  }

  cambiaPassword() {
    if (this.passData.nuovaPassword !== this.passData.confermaPassword) {
      alert("Le password non coincidono!");
      return;
    }
    this.http.post('http://localhost:8080/api/utente/me/password', this.passData).subscribe({
      next: () => {
        alert('Password cambiata! Devi fare login di nuovo.');
        this.authService.logout(); // Logout forzato per sicurezza
      },
      error: (err) => alert(err.error || 'Errore cambio password')
    });
  }
}
