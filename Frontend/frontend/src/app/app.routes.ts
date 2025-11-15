import { Routes } from '@angular/router';

import { RegistrazioneComponent } from './pagine/registrazione/registrazione.component';

import { LoginComponent } from './pagine/login/login.component';

export const routes: Routes = [
  { path: 'registrazione', component: RegistrazioneComponent },

  // 2. Aggiungi la nuova rotta per il login
  { path: 'login', component: LoginComponent },

  // 3. (Opzionale ma consigliato) Reindirizza la home page (il percorso vuoto)
  //    alla pagina di login o di registrazione.
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
