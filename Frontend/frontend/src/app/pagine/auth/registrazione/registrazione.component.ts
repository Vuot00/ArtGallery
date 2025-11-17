import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {RouterLink} from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrazione',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrazione.component.html',
  styleUrl: './registrazione.component.scss'
})
export class RegistrazioneComponent {

  datiRegistrazione = {
    nome: '',
    email: '',
    password: '',
    tipoUtente: 'COLLEZIONISTA'
  };

  private backendUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private router: Router) { }

  registra() {
    // Pulisce gli input
    this.datiRegistrazione.nome = this.datiRegistrazione.nome.trim();
    this.datiRegistrazione.email = this.datiRegistrazione.email.trim();
    this.datiRegistrazione.password = this.datiRegistrazione.password.trim();

    console.log('Dati inviati al backend:', this.datiRegistrazione);


    this.http.post(
      `${this.backendUrl}/api/auth/registrazione`,
      this.datiRegistrazione,
      { responseType: 'text' }
    )
      .subscribe({
        next: (risposta) => {
          alert(risposta);
          this.router.navigate(['/login'])
        },
        error: (errore: HttpErrorResponse) => {
          if (errore.status === 400) {
            // Errore 400 (es. Email già in uso)
            alert(errore.error);
          } else {
            // Altri errori (es. 500, o se il backend è spento)
            alert('Si è verificato un errore di rete: ' + errore.statusText);
          }
        }
      });
  }
}
