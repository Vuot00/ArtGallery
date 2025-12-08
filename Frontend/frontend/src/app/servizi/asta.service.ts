import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AstaService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/aste';
    private authService = inject(AuthService);


    avviaAsta(idOpera: number, datiAsta: { prezzoPartenza: number, dataInizio: string, dataFine: string }): Observable<any> {
        const url = `${this.apiUrl}/avvia/${idOpera}`;

        // Recuperiamo il token per l'autenticazione
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.post(url, datiAsta, { headers });
    }


    annullaAsta(idAsta: number): Observable<any> {
        const url = `${this.apiUrl}/${idAsta}/annulla`;

        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        // responseType: 'text' è fondamentale perché il backend restituisce una stringa semplice, non un JSON
        return this.http.delete(url, { headers, responseType: 'text' });
    }
}
