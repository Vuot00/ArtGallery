import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servizi/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  public authService = inject(AuthService);//messo public per far si che l HTML lo legga
  private router = inject(Router);

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
