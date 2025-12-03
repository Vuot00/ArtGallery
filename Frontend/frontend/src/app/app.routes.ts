import { Routes } from '@angular/router';
import { RegistrazioneComponent } from './pagine/auth/registrazione/registrazione.component';
import { LoginComponent } from './pagine/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pagine/dashboard/home/home.component';
import { authGuard } from './servizi/auth.guard';
import { CaricaOperaComponent } from './pagine/artista/carica-opera/carica-opera.component';
import { TestConnectionComponent } from './pagine/test-connection/test-connection.component';
import { ProfiloComponent } from './pagine/profilo/profilo.component';
import { DettaglioOperaComponent } from './pagine/dettaglio-opera/dettaglio-opera.component';
import { ModificaOperaComponent } from './pagine/artista/modifica-opera/modifica-opera.component';
import {ProfiloPubblicoComponent} from './pagine/profilo-pubblico/profilo-pubblico.component';
import {AstaLiveComponent} from "./pagine/asta-live/asta-live.component";
import {CheckoutComponent} from './pagine/checkout/checkout.component';


export const routes: Routes = [
  // --- ROTTE PUBBLICHE (Senza Sidebar/Navbar) ---
  { path: 'login', component: LoginComponent },
  { path: 'registrazione', component: RegistrazioneComponent },
  { path: 'asta/:id', component: AstaLiveComponent }, // :id sarà l'ID dell'ASTA

  // --- REDIRECT INIZIALE ---
  // Se vado su "localhost:4200" vuoto, mi manda al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // --- ROTTE PROTETTE (Con Sidebar, Navbar e AuthGuard) ---
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Protegge tutte le pagine qui sotto
    children: [
      // Se sono nel layout ma senza path specifico, vado alla home
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // Pagine dell'applicazione
      { path: 'home', component: HomeComponent },
      { path: 'carica-opera', component: CaricaOperaComponent },
      { path: 'modifica-opera/:id', component: ModificaOperaComponent },
      { path: 'opera/:id', component: DettaglioOperaComponent },
      { path: 'test', component: TestConnectionComponent },
      { path: 'profilo', component: ProfiloComponent },
      { path: 'profilo/:id', component: ProfiloPubblicoComponent },
      { path: 'checkout/:id', component: CheckoutComponent },
    ]
  },

  // (Opzionale) Wildcard: se l'utente scrive un URL a caso, torna al login
  { path: '**', redirectTo: 'login' }
];
