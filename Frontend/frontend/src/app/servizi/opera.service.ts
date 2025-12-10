import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opera } from '../models/opera.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OperaService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/opere';

  // Iniettiamo il servizio che gestisce la sicurezza
  private authService = inject(AuthService);

  getOpere(): Observable<Opera[]> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Opera[]>(this.apiUrl, { headers: headers });
  }

  // creiamo un payload multipart, unico modo per inviare testo e immagini in un'unica richiesta HTTP
  caricaOpera(dati: any, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('titolo', dati.titolo);
    formData.append('descrizione', dati.descrizione);
    formData.append('prezzo', dati.prezzo);

    for (let file of files) {
      formData.append('files', file);
    }

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post(this.apiUrl, formData, {
      headers: headers,
      responseType: 'text' // qui in elimina, carica e modifica imposto text per dire ad angular di non aspettarsi
      // un JSON ma una stringa di testo
    });
  }

  eliminaOpera(idOpera: number): Observable<any> {

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // responseType: 'text' perché il backend risponde con una stringa
    return this.http.delete(`${this.apiUrl}/${idOpera}`, { headers, responseType: 'text' });
  }

  aggiungiFoto(idOpera: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post(`${this.apiUrl}/${idOpera}/immagini`, formData, { headers });
  }

  eliminaFoto(idImmagine: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.delete(`${this.apiUrl}/immagini/${idImmagine}`, { headers, responseType: 'text' });
  }

  modificaOpera(id: number, dati: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ // ho bisogno dell'header perchè faccio un'operazione di put
      // stessa cosa sopra per delete
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(url, dati, { headers: headers, responseType: 'text' });
  }

  getOperaById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`); // non mi serve il token faccio solo una get
  }

  getOpereByArtistaId(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/artista/id/${id}`, { headers });
  }

  getImmagineUrl(nomeFile: string): string {
    return `http://localhost:8080/uploads/${nomeFile}`;
  }
}
