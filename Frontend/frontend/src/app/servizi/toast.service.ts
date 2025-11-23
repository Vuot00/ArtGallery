import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message = signal('');
  type = signal<ToastType>('info');
  isVisible = signal(false);

  private timeoutId: any;

  /**
   * Mostra la notifica
   * @param msg Il testo del messaggio
   * @param type Il tipo: 'success' (verde), 'error' (rosso), 'info' (blu)
   * @param duration Durata in ms (default 3000ms = 3 secondi)
   */

  show(msg: string, type: ToastType = 'success', duration: number = 3000) {
    this.message.set(msg);
    this.type.set(type);
    this.isVisible.set(true);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.close();
    }, duration);
  }

  close() {
    this.isVisible.set(false);
  }
}
