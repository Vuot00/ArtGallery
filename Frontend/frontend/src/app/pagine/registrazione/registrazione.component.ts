import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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


  datiRegistrazione = {
    nome: '',
    email: '',
    password: ''
  };


  constructor(private http: HttpClient) { }


  registra() {
    console.log('Dati inviati al backend:', this.datiRegistrazione);

    // 7. Usiamo http.post per chiamare l'API che hai creato nel backend
    this.http.post('/api/auth/registrazione', this.datiRegistrazione)
      .subscribe({
        next: (risposta) => {
          // Quando il server risponde con successo
          console.log('Risposta dal server:', risposta);
          alert('Registrazione avvenuta con successo!');
          // Qui potresti reindirizzare l'utente alla pagina di login
        },
        error: (errore) => {
          // Quando il server dà un errore
          console.error('Errore durante la registrazione:', errore);
          alert('Si è verificato un errore: ' + errore.message);
        }
      });
  }
}
