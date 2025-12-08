import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servizi/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../servizi/search.service';
import {debounceTime, distinctUntilChanged, of, Subject, switchMap} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NotificationService, Notifica } from '../../servizi/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule,FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  public authService = inject(AuthService);//messo public per far si che l HTML lo legga
  private router = inject(Router);
  private searchService = inject(SearchService);
  public notificationService = inject(NotificationService);

  username: string = 'Utente';

  //gestione della ricerca in real time
  testoRicerca: string = '';
  risultati: any = null; // Conterrà { utenti: [], opere: [] }
  showDropdown: boolean = false;

  private searchSubject = new Subject<string>();

  ngOnInit() {
    const nome = this.authService.getUsername();
    if (nome) {
      this.username = nome;
    }
    this.searchSubject.pipe(
      debounceTime(300), // Aspetta 300ms dopo che l'utente smette di scrivere
      distinctUntilChanged(), // Evita ricerche uguali consecutive
      switchMap((query) => {
        if (!query || query.length < 2) {
          return of(null); // Se la query è vuota, svuota i risultati
        }
        return this.searchService.cercaGlobale(query); // Chiama il backend
      })
    ).subscribe(res => {
      this.risultati = res;
      this.showDropdown = true;
    });
    if (this.authService.isLoggedIn()) {
      this.notificationService.startPolling();}
  }

  onSearchType(query: string) {
    this.searchSubject.next(query);
    if (!query) {
      this.showDropdown = false;
    }
  }
  vaiA(path: string) {
    this.showDropdown = false; // Chiudi il menu
    this.testoRicerca = '';    // Pulisci l'input
    this.router.navigate([path]);
  }

  logout() {
    this.notificationService.stopPolling();
    this.authService.logout();
    this.router.navigate(['login']);
  }
  segnaLette() {
    this.notificationService.markAllAsRead();
  }

}
