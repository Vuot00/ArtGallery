import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  // Usiamo i Signals (moderni e veloci)
  // true = Aperta, false = Chiusa
  sidebarOpen = signal(true);

  toggleSidebar() {
    this.sidebarOpen.update(value => value);
    console.log(this.sidebarOpen());
  }
}
