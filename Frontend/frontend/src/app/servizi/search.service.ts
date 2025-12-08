import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/search';

  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  cercaGlobale(query: string): Observable<any> {
    const url = `${this.apiUrl}/global?q=${query}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }
}
