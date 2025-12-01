import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject, Observable, filter, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private client: Client;
    // BehaviorSubject tiene traccia se siamo connessi o no
    private connectionStatus = new BehaviorSubject<boolean>(false);

    constructor() {
        // 1. Recupera il token
        const token = localStorage.getItem('jwtToken');

        // 2. Costruisci l'URL dinamico.
        // Se il token non c'è, usiamo l'URL base (il server risponderà 403, ma evitiamo crash client)
        const baseUrl = 'ws://localhost:8080/ws-auction';
        const brokerUrl = token ? `${baseUrl}?access_token=${token}` : baseUrl;

        console.log("🔌 Configurazione WebSocket con Token...");

        this.client = new Client({
            brokerURL: brokerUrl,
            reconnectDelay: 5000, // Riprova ogni 5s se cade la linea
            // debug: (str) => console.log(str), // Decommenta per vedere log dettagliati STOMP
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

        // 3. Attiva la connessione solo se abbiamo un token (o prova comunque se vuoi gestire l'errore)
        if (token) {
            this.client.activate();
        } else {
            console.warn("⚠️ WebSocket: Nessun token trovato. Connessione non avviata.");
        }
    }

    /**
     * Helper interno: aspetta che la connessione sia TRUE prima di procedere
     */
    private waitForConnection(): Observable<boolean> {
        return this.connectionStatus.asObservable().pipe(
            filter(isConnected => isConnected === true)
        );
    }

    /**
     * Si iscrive al canale di una specifica asta.
     */
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

                    // Cleanup: quando il componente fa unsubscribe, stacchiamo solo questo topic
                    return () => {
                        subscription.unsubscribe();
                    };
                });
            })
        );
    }
}