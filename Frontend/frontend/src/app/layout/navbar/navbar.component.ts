import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servizi/auth.service';
import { Router } from '@angular/router';
import {LayoutService} from '../../servizi/layout.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  // Iniettiamo il servizio
  private authService = inject(AuthService);

  public layoutService=inject(LayoutService);


  private router = inject(Router);

  // Variabile per l'HTML
  username: string = 'Utente';

  ngOnInit() {
    const nome = this.authService.getUsername();
    if (nome) {
      this.username = nome;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

}
