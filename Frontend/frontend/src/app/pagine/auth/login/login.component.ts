import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../servizi/auth.service';
import { ToastService } from '../../../servizi/toast.service';

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
  private toastService = inject(ToastService);

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

        // Credenziali Errate (401 o 403)
        // Spring a volte usa 403 anche per password sbagliata
        if (err.status === 401 || err.status === 403) {
          const msg = 'Credenziali errate. Controlla email e password.';
          this.toastService.show(msg, 'error');
          this.errorMessage = msg;
        }

        //Backend Spento o Errore di Rete (0)
        else if (err.status === 0) {
          const msg = 'Impossibile contattare il server. Controlla la connessione.';
          this.toastService.show(msg, 'error');
          this.errorMessage = msg;
        }

        //  Errore del Server (500)
        else {
          const msg = 'Si è verificato un errore imprevisto (' + err.status + ').';
          this.toastService.show(msg, 'error');
          this.errorMessage = msg;
        }
      }
    });
  }
}
