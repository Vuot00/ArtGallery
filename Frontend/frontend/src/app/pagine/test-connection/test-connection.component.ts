import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-connection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h1>🛠️ Pagina di Test Connessione</h1>

      <div class="status-box" [class.success]="messaggio" [class.error]="errore">
        <h2>Stato Backend:</h2>
        <p *ngIf="messaggio">{{ messaggio }}</p>
        <p *ngIf="errore">{{ errore }}</p>
        <p *ngIf="!messaggio && !errore">Tentativo di connessione in corso...</p>
      </div>

      <button (click)="checkConnection()">Riprova Connessione</button>
      <br><br>
      <a href="/home">Torna alla Home</a>
    </div>
  `,
  styles: [`
    .test-container { padding: 40px; text-align: center; font-family: monospace; }
    .status-box {
      padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 8px; background: #eee; border: 2px solid #ccc;
    }
    .status-box.success { background-color: #d4edda; border-color: #c3e6cb; color: #155724; }
    .status-box.error { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; }
    button { padding: 10px 20px; cursor: pointer; }
  `]
})
export class TestConnectionComponent implements OnInit {

  private http = inject(HttpClient);

  messaggio: string = '';
  errore: string = '';

  ngOnInit() {
    this.checkConnection();
  }

  checkConnection() {
    this.messaggio = '';
    this.errore = '';

    // Chiamata all'endpoint di test del backend
    this.http.get<any>('http://localhost:8080/api/test').subscribe({
      next: (res) => {
        this.messaggio = res.messaggio || 'Connessione OK (JSON ricevuto)';
      },
      error: (err) => {
        console.error(err);
        this.errore = 'ERRORE: Il backend non risponde o blocca la richiesta (403/CORS).';
      }
    });
  }
}
