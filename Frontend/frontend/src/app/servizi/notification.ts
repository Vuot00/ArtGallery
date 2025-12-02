import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, interval, startWith, switchMap, map} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/notifiche'; // Endpoint da creare

  // Subject reattivo che contiene il conteggio attuale
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable(); // Observable pubblico

  // Metodo per avviare il polling (chiamato una volta dal Navbar)
  startPolling() {
    // Chiama l'API ogni 30 secondi (o meno, a seconda delle necessità)
    interval(30000).pipe(
      startWith(0), // Esegue immediatamente al subscribe
      switchMap(() => this.getUnreadCountFromBackend())
    ).subscribe(count => {
      this.unreadCountSubject.next(count);
    });
  }

  private getUnreadCountFromBackend(): Observable<number> {

    return this.http.get<any>(this.apiUrl + '/count').pipe(
      // Assumendo che il backend risponda con un JSON tipo { count: 0 }
      map(response => response.count));
  }

  // Metodo per decrementare (es. quando l'utente le legge)
  markAsRead() {
    this.unreadCountSubject.next(0); // Setta a 0 per esempio
  }
}
