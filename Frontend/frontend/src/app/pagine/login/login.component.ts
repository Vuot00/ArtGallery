import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,


  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // Dati collegati al form HTML
  datiLogin = {
    email: '',
    password: ''
  };

  // URL DEL BACKEND
  private backendUrl = 'http://localhost:8080';

  // Inietta HttpClient (per le chiamate) e Router (per il redirect)
  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Funzione chiamata quando il form viene inviato.
   */
  login() {

    // Pulisce gli input da spazi bianchi all'inizio o alla fine
    this.datiLogin.email = this.datiLogin.email.trim();
    this.datiLogin.password = this.datiLogin.password.trim();

    console.log('Tentativo di login con:', this.datiLogin);

    // Esegue la chiamata POST all'URL completo del backend
    this.http.post<any>(`${this.backendUrl}/api/auth/login`, this.datiLogin)
      .subscribe({

        // --- SUCCESSO ---
        next: (risposta) => {
          console.log('Risposta dal server:', risposta);

          // Salva il token JWT nel browser
          localStorage.setItem('token', risposta.token);

          // Reindirizza l'utente alla pagina principale (es. '/')
          this.router.navigate(['/']);
        },

        // --- ERRORE ---
        error: (errore: HttpErrorResponse) => {
          console.error('Errore durante il login:', errore);

          // Gestione Errori Migliorata
          if (errore.status === 401) {
            // 401 = Unauthorized (credenziali errate)
            alert('Email o password non corretti.');
          } else if (errore.status === 403) {
            // 403 = Forbidden (blocco di sicurezza, es. CORS)
            alert('Errore di sicurezza: il server ha bloccato la richiesta (403 Forbidden).');
          } else if (errore.status === 0) {
            // 0 = Errore di rete (backend spento o CORS bloccato dal browser)
            alert('Errore di rete: impossibile raggiungere il server. (Controlla il backend)');
          } else {
            // Altri errori
            alert(`Si è verificato un errore sconosciuto: ${errore.statusText}`);
          }
        }
      });
  }
}
