import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../servizi/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // 1. Iniettiamo i servizi
  private authService = inject(AuthService);
  private router = inject(Router);

  datiLogin = { email: '', password: '' };
  errorMessage = '';

  login() {
    // Pulizia dati
    this.datiLogin.email = this.datiLogin.email.trim();
    this.datiLogin.password = this.datiLogin.password.trim();

    this.authService.login(this.datiLogin).subscribe({

      next: (risposta) => {
        console.log('Login riuscito! Token ricevuto.');

        this.router.navigate(['/home']);
      },

      error: (err) => {
        console.error('Login fallito:', err);
        if (err.status === 401) {
          this.errorMessage = "Credenziali errate. Riprova.";
        } else {
          this.errorMessage = "Errore di connessione col server.";
        }
      }
    });
  }
}
