import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  // Usiamo i Signals (moderni e veloci)
  // true = Aperta, false = Chiusa
  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(value => !value);
    console.log(this.sidebarOpen());
  }
}
