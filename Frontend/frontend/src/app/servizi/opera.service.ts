import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperaService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/opere';

  caricaOpera(dati: any, file: File): Observable<any> {
    const formData = new FormData();

    formData.append('titolo', dati.titolo);
    formData.append('descrizione', dati.descrizione);
    formData.append('prezzo', dati.prezzo);
    formData.append('anno', dati.anno);


    formData.append('immagine', file);

    return this.http.post(this.apiUrl, formData);
  }
}
