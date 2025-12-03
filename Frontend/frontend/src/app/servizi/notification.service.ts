import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, startWith, switchMap, map, Subscription, tap } from 'rxjs';
import { AuthService } from './auth.service'; // Assicurati che il percorso sia corretto

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/notifiche';
  private authService = inject(AuthService);

  // Subject reattivo che contiene il conteggio attuale
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSubscription: Subscription | null = null;

  // Metodo per avviare il polling (chiamato una volta dal Navbar)
  startPolling() {
    // Evita di avviare polling multipli
    if (this.pollingSubscription) {
      console.warn("Polling notifiche già attivo.");
      return;
    }

    console.log("🔔 Avvio Polling Notifiche.");

    this.pollingSubscription = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getUnreadCountFromBackend())
    ).subscribe(count => {
      this.unreadCountSubject.next(count);
    }, error => {
      // Se c'è un errore (es. 403 se il token scade) smettiamo di pollare
      console.error("Errore nel polling notifiche:", error);
      this.stopPolling();
      // Opzionale: gestire il logout o il re-login qui
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
      this.unreadCountSubject.next(0); // Resetta il conteggio
      console.log("🛑 Polling Notifiche interrotto.");
    }
  }

  private getUnreadCountFromBackend(): Observable<number> {
    const token = localStorage.getItem('jwtToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(this.apiUrl + '/count', { headers: headers }).pipe(
      map(response => response.count)
    );
  }

  markAsRead() {
    // Implementazione logica lato server per marcare come letto
    // Per ora, solo resetta il contatore locale
    this.unreadCountSubject.next(0);
  }
}
