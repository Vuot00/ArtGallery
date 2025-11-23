import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Opera} from '../models/opera.model';


@Injectable({
  providedIn: 'root'
})
export class OperaService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/opere';

  getOpere(): Observable<Opera[]> {
    const token = localStorage.getItem('jwtToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Opera[]>(this.apiUrl, {headers: headers});
  }

  caricaOpera(dati: any, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('titolo', dati.titolo);
    formData.append('descrizione', dati.descrizione);
    formData.append('prezzo', dati.prezzo);

    for (let file of files) {
      formData.append('files', file);
    }

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post(this.apiUrl, formData, {
      headers: headers,
      responseType: 'text'
    });
  }

  eliminaOpera(idOpera: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // responseType: 'text' perché il backend risponde con una stringa
    return this.http.delete(`${this.apiUrl}/${idOpera}`, { headers, responseType: 'text' });
  }

  aggiungiFoto(idOpera: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post(`${this.apiUrl}/${idOpera}/immagini`, formData, { headers });
  }

  eliminaFoto(idImmagine: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.delete(`${this.apiUrl}/immagini/${idImmagine}`, { headers, responseType: 'text' });
  }

  modificaOpera(id: number, dati: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;

    // Recupera il token per l'autorizzazione
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Stiamo mandando JSON
    });

    return this.http.put(url, dati, { headers: headers, responseType: 'text' });
  }

  getOperaById(id: number): Observable<any> {

    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getImmagineUrl(nomeFile: string): string {
    return `http://localhost:8080/uploads/${nomeFile}`;
  }

}
