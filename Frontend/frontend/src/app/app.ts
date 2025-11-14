import { Component, OnInit, inject } from '@angular/core'; // 1. Aggiungi OnInit, inject
import { CommonModule } from '@angular/common';           // 2. Importa CommonModule
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';       // 3. Importa HttpClient

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,   // 4. Aggiungi CommonModule
    RouterOutlet
  ],
  // 5. Questo è l'HTML che verrà mostrato
  template: `
    <h1>Test di Connessione Frontend-Backend</h1>

    <h2>Stato:</h2>
    <p style="font-family: monospace; background-color: #eee; padding: 10px;">
      {{ messaggioDalBackend }}
    </p>

    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit { // 6. Implementa OnInit

  // Variabile per salvare il messaggio
  messaggioDalBackend: string = "In attesa di risposta dal server...";

  // Inietta il client HTTP
  private http = inject(HttpClient);

  // ngOnInit viene chiamato automaticamente all'avvio del componente
  ngOnInit(): void {

    // Chiamiamo l'API del backend
    this.http.get<any>('http://localhost:8080/api/test')
      .subscribe(
        (risposta) => {
          // Successo!
          this.messaggioDalBackend = risposta.messaggio;
        },
        (errore) => {
          // Errore!
          this.messaggioDalBackend = "ERRORE: Impossibile connettersi al backend. (Controlla il CORS?)";
          console.error(errore);
        }
      );
  }
}
