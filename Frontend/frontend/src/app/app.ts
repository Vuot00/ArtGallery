import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],


  template: `
    <h1>Art Gallery (app.ts)</h1>

    <h2>Stato:</h2>
    <p style="font-family: monospace; background-color: #eee; padding: 10px;">
      {{ messaggioDalBackend }}
    </p>

    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {

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
          this.messaggioDalBackend = risposta.messaggio;
        },
        (errore) => {
          this.messaggioDalBackend = "ERRORE: Impossibile connettersi al backend. (Controlla il CORS?)";
          console.error(errore);
        }
      );
  }
}
