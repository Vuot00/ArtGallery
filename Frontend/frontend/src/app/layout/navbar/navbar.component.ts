import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // AGGIUNTO OnDestroy
import { AuthService } from '../../servizi/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../servizi/search.service';
import {debounceTime, distinctUntilChanged, of, Subject, switchMap} from 'rxjs';
import { FormsModule } from '@angular/forms';
import {NotificationService} from '../../servizi/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {

  public authService = inject(AuthService);
  private router = inject(Router);
  private searchService = inject(SearchService);
  public notificationService = inject(NotificationService);

  username: string = 'Utente';

  // Gestione della ricerca in real time
  testoRicerca: string = '';
  risultati: any = null;
  showDropdown: boolean = false;

  private searchSubject = new Subject<string>();

  ngOnInit() {
    const nome = this.authService.getUsername();
    if (nome) {
      this.username = nome;
    }

    // this.notificationService.startPolling();
  }

// Nel metodo logout() metti in commento anche questa riga
  logout() {
    // this.notificationService.stopPolling(); // Mettere in commento
    this.authService.logout();
    this.router.navigate(['login']);
  }

  ngOnDestroy() {
    // IMPORTANTE: Ferma il polling quando il componente viene distrutto per evitare memory leak.
    this.notificationService.stopPolling();
  }

  onSearchType(query: string) {
    this.searchSubject.next(query);
    if (!query) {
      this.showDropdown = false;
    }
  }

  vaiA(path: string) {
    this.showDropdown = false;
    this.testoRicerca = '';
    this.router.navigate([path]);
  }


}
