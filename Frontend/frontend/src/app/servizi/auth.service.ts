import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  login(loginRequest: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          const token = response.token;

          if (token) {
            // salviamo il token nel browser
            localStorage.setItem('jwtToken', token);

            console.log("Token salvato con successo:", token);
          }
        })
      );
  }

  // Metodo Logout
  logout() {
    localStorage.removeItem('jwtToken');
  }

  // Metodo  utente loggato
  isLoggedIn(): boolean {
    // Se c'è un token nel localStorage siamo loggati
    return !!localStorage.getItem('jwtToken');
  }

  //Recupera e decodifica il token
  getDecodedToken(): any {
    const token = localStorage.getItem('jwtToken');
    try {
      return token ? jwtDecode(token) : null;
    } catch(Error) {
      return null;
    }
  }

  //  Controlla se l'utente è ARTISTA
  isArtist(): boolean {
    const tokenPayload = this.getDecodedToken();

    // Se non c'è token o non ci sono ruoli, ritorna false
    if (!tokenPayload || !tokenPayload.roles) {
      return false;
    }

    // Controlla se nella lista dei ruoli c'è quello dell'artista
    //La stringa deve essere IDENTICA a quella nel Database
    return tokenPayload.roles.includes('ROLE_ARTISTA');
  }

  //Ottieni il nome utente (email) dal token
  getUsername(): string {
    const tokenPayload = this.getDecodedToken();
    return tokenPayload ? tokenPayload.sub : '';
  }
}
