import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrazione',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './registrazione.component.html',
  styleUrl: './registrazione.component.scss'
})
export class RegistrazioneComponent {

  // Diamo un valore predefinito, ma dovra essere  collegato all'HTML
  datiRegistrazione = {
    nome: '',
    email: '',
    password: '',
    tipoUtente: 'COLLEZIONISTA'
  };


  constructor(private http: HttpClient) { }


  registra() {
    console.log('Dati inviati al backend:', this.datiRegistrazione);

    this.http.post(
      '/api/auth/registrazione', // L'URL del backend
      this.datiRegistrazione,    // dati da inviare
      { responseType: 'text' }
    )
      .subscribe({
        next: (risposta) => {
          console.log('Risposta dal server:', risposta);
          alert(risposta);
        },
        error: (errore: HttpErrorResponse) => {
          console.error('Errore durante la registrazione:', errore);

          if (errore.status === 400) {
            alert(errore.error);
          } else {
            // Altri errori (500, 403, 404...)
            alert('Si è verificato un errore di rete: ' + errore.statusText);
          }
        }
      });
  }
}
