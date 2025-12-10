import { inject, Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject, Observable, filter, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private authService = inject(AuthService);

  constructor() {
    console.log("🔌 Inizializzazione Servizio WebSocket...");

    this.client = new Client({
      // Mettiamo l'URL base senza token qui
      brokerURL: 'ws://localhost:8080/ws-auction',
      reconnectDelay: 5000,

      // Questa funzione viene eseguita OGNI VOLTA che il socket prova a connettersi.
      // Quindi prenderà sempre il token aggiornato (o null se sloggato).
      beforeConnect: () => {
        const token = this.authService.getToken();

        if (token) {
          console.log("🔑 WebSocket: Aggiungo token fresco alla connessione.");
          // Modifichiamo l'URL al volo aggiungendo il token
          this.client.brokerURL = `ws://localhost:8080/ws-auction?access_token=${token}`;
        } else {
          console.warn("⚠️ WebSocket: Nessun token trovato prima della connessione.");
        }
      },
    });

    this.client.onConnect = (frame) => {
      console.log('🔗 WebSocket STOMP Connesso!');
      this.connectionStatus.next(true);
    };

    this.client.onStompError = (frame) => {
      console.error('Broker error: ' + frame.headers['message']);
      console.error('Details: ' + frame.body);
    };

    this.client.onWebSocketClose = () => {
      console.log('❌ WebSocket Disconnesso');
      this.connectionStatus.next(false);
    };

    this.client.activate();
  }

  // mantiene in sospeso tutte le richieste finchè il weboscket non è connesso
  private waitForConnection(): Observable<boolean> {
    return this.connectionStatus.asObservable().pipe(
      filter(isConnected => isConnected === true)
    );
  }

  // ricevo aggiornamenti sull'asta finchè non viene fatto unsubscribe
  watchAsta(idAsta: number): Observable<any> {
    return this.waitForConnection().pipe(
      switchMap(() => {
        return new Observable<any>(observer => {
          console.log(`📡 Sottoscrizione al topic: /topic/aste/${idAsta}`);

          const subscription = this.client.subscribe(`/topic/aste/${idAsta}`, (message: Message) => {
            if (message.body) {
              observer.next(JSON.parse(message.body));
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        });
      })
    );
  }
}
