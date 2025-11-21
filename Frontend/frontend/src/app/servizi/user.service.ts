import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // 'of' serve per i dati finti

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/utente';

  // Helper per il token
  private getHeaders() {
    const token = localStorage.getItem('jwtToken');
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

  // --- TODO: FUTURE IMPLEMENTAZIONI ---

  getAcquisti(): Observable<any[]> {
    // Quando avrai il backend: return this.http.get(...)
    return of([]); // Ritorna lista vuota per ora
  }

  getVendite(): Observable<any[]> {
    return of([]); // Ritorna lista vuota per ora
  }
}
