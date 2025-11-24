import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servizi/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  // layoutService rimosso dall'uso se non serve più per il toggle sidebar
  // public layoutService = inject(LayoutService);

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