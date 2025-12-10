import { Injectable , signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  userNameSignal = signal<string>('');

  constructor(private http: HttpClient) {
    this.aggiornaNomeDaToken(); // cosi appena parte il sito, riempiamo il signal con il nome ricavato dal token
  }

  private aggiornaNomeDaToken() {
    const tokenData: any = this.getDecodedToken();
    if (tokenData && tokenData.nome) {
      this.userNameSignal.set(tokenData.nome);
    } else if (tokenData && tokenData.sub) {
      this.userNameSignal.set(tokenData.sub); // Fallback sull'email
    }
  }

  login(loginRequest: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          // Cerchiamo il token sia come 'token' che come 'accessToken' per sicurezza
          const token = response.token || response.accessToken;

          if (token) {
            // Salviamo il token nella chiave 'jwtToken'
            localStorage.setItem('jwtToken', token);

            this.aggiornaNomeDaToken();

            console.log("Token salvato con successo:", token);
          }
        })
      );
  }

  updateNameManual(nuovoNome: string) {
    this.userNameSignal.set(nuovoNome);
  }


  getEmail(): string {
    const token: any = this.getDecodedToken();
    if (token && token.sub) {
      return token.sub; // 'sub' contiene l'email
    }
    return '';
  }

  // Metodo Logout
  logout() {
    localStorage.removeItem('jwtToken');
    this.userNameSignal.set(''); // cosi che siamo sicuri che il campo rimanga pulito
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

  getToken(): string | null {
    const token = localStorage.getItem('jwtToken');

    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }

    return null;
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
    return this.userNameSignal();
  }

  getId(): number {
    const tokenPayload = this.getDecodedToken();
    if (tokenPayload && tokenPayload.id) {
      return tokenPayload.id;
    }
    return 0;
  }
}
