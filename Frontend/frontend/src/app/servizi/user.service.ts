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

  getProfiloPubblico(id: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }

  // --- TODO: FUTURE IMPLEMENTAZIONI ---

  getAcquisti(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/acquisti`, this.getHeaders());  }

  getVendite(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/vendite`, this.getHeaders());
  }


}
