import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private client: Client;
    private connected = false;

    constructor() {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/ws-auction',
            reconnectDelay: 5000,
            debug: (str) => console.log(str),
        });

        this.client.onConnect = () => {
            this.connected = true;
            console.log('🔗 WebSocket Connesso!');
        };

        this.client.activate();
    }


    watchAsta(idAsta: number): Subject<any> {
        const subject = new Subject<any>();

        const trySubscribe = () => {
            if (this.connected) {
                // Mi iscrivo al topic specifico (es. /topic/aste/15)
                this.client.subscribe(`/topic/aste/${idAsta}`, (message: Message) => {
                    if (message.body) {
                        subject.next(JSON.parse(message.body));
                    }
                });
            } else {
                setTimeout(trySubscribe, 500);
            }
        };

        trySubscribe();
        return subject;
    }
}