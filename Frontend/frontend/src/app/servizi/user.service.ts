import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = 'http://localhost:8080/api/utente';

  // Questo metodo prende il token pulito dal servizio
  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    };
  }

  getProfilo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, this.getHeaders());
  }

  updateProfilo(dati: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, dati, this.getHeaders());
  }

  changePassword(datiPassword: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/me/password`, datiPassword, this.getHeaders());
  }

  getProfiloPubblico(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  getAcquisti(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/acquisti`, this.getHeaders());
  }

  getVendite(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vendite`, this.getHeaders());
  }
}
