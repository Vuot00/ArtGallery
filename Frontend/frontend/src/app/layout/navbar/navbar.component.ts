import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servizi/auth.service';

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

  // Variabile per l'HTML
  username: string = 'Utente';

  ngOnInit() {
    const emailOrName = this.authService.getUsername();
    if (emailOrName) {
      this.username = emailOrName;
    }
  }

}
