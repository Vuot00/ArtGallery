import { Routes } from '@angular/router';
import { RegistrazioneComponent } from './pagine/auth/registrazione/registrazione.component';
import { LoginComponent } from './pagine/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pagine/dashboard/home/home.component';
import { authGuard } from './servizi/auth.guard';
import { CaricaOperaComponent } from './pagine/artista/carica-opera/carica-opera.component';
import {TestConnectionComponent} from './pagine/test-connection/test-connection.component';
import { ProfiloComponent } from './pagine/profilo/profilo.component';

export const routes: Routes = [
  { path: 'registrazione', component: RegistrazioneComponent },
  { path: 'login', component: LoginComponent },
  { path: 'carica-opera', component: CaricaOperaComponent },
  { path: 'test', component: TestConnectionComponent },
  { path: 'profilo', component: ProfiloComponent },

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
