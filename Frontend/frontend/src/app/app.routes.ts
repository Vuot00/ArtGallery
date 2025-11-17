import { Routes } from '@angular/router';
import { RegistrazioneComponent } from './pagine/auth/registrazione/registrazione.component';
import { LoginComponent } from './pagine/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pagine/dashboard/home/home.component';
import { authGuard } from './servizi/auth.guard';

export const routes: Routes = [
  { path: 'registrazione', component: RegistrazioneComponent },
  { path: 'login', component: LoginComponent },

  //  Reindirizza la home page (il percorso vuoto)
  //    alla pagina di login o di registrazione.
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      // Qui aggiungeremo 'carica-opera', 'profilo', ecc.
    ]
  },
];
