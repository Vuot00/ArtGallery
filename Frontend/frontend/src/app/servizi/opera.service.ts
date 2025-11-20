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

  caricaOpera(dati: any, file: File): Observable<any> {
    const formData = new FormData();

    formData.append('titolo', dati.titolo);
    formData.append('descrizione', dati.descrizione);
    formData.append('prezzo', dati.prezzo);
    formData.append('anno', dati.anno);
    formData.append('file', file);

    const token = localStorage.getItem('jwtToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, formData, { headers: headers ,responseType: 'text'});
  }
}
