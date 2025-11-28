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
        this.client = new Client({
            // Assicurati che l'URL sia corretto (ws:// se HTTP, wss:// se HTTPS)
            brokerURL: 'ws://localhost:8080/ws-auction',
            reconnectDelay: 5000, // Riprova a connettersi ogni 5s se cade
            debug: (str) => console.log(str),
        });

        this.client.onConnect = () => {
            console.log('🔗 WebSocket Connesso!');
            this.connectionStatus.next(true);
        };

        this.client.onDisconnect = () => {
            console.log('❌ WebSocket Disconnesso');
            this.connectionStatus.next(false);
        };

        // Avvia la connessione appena il service viene istanziato
        this.client.activate();
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
     * Gestisce l'attesa della connessione in modo trasparente.
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