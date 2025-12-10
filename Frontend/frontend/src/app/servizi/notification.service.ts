import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, startWith, switchMap, map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

export interface Notifica {
  id: number;
  messaggio: string;
  dataCreazione: string;
  letta: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/notifiche';
  private authService = inject(AuthService);

  private notificheSubject = new BehaviorSubject<Notifica[]>([]);
  notifiche$ = this.notificheSubject.asObservable();

  unreadCount$ = this.notifiche$.pipe(
    map(list => list.filter(n => !n.letta).length)
  );

  private pollingSubscription: any = null;

  startPolling() {
    if (this.pollingSubscription) {
      return;
    }

    this.pollingSubscription = interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        const token = this.authService.getToken();

        // Controllo di sicurezza: se il token non è valido, salta la chiamata
        if (!token || token === 'null' || !token.includes('.')) {
          return of(null);
        }
        return this.fetchNotifications();
      })
    ).subscribe({
      next: () => {
        // Le notifiche vengono aggiornate dentro fetchNotifications
      },
      error: (err) => {
        console.error("Errore polling notifiche:", err);
        this.stopPolling();
      }
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  fetchNotifications(): Observable<any> {
    const token = this.authService.getToken();

    if (!token || token === 'null' || token === 'undefined') {
      return of([]);
      /**
       Questo è RxJS. Invece di restituire null o lanciare errore, restituisce un Observable
       che emette una lista vuota. Questo permette a chi sta ascoltando (il subscribe) di ricevere
       un valore valido (array vuoto) e non rompersi.
       */
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get<Notifica[]>(this.apiUrl, { headers }).pipe(
      map(data => {
        this.notificheSubject.next(data);
        return data;
      }),
      catchError(err => {
        console.error('Errore recupero notifiche:', err);
        return of([]);
      })
    );
  }

  // è come se impostassi manualmente il valore true per il valore letta
  markAllAsRead() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(this.apiUrl + '/leggi-tutte', {}, { headers }).subscribe(() => {
      const current = this.notificheSubject.value;
      const updated = current.map(n => ({ ...n, letta: true }));
      this.notificheSubject.next(updated);
    });
  }
}
