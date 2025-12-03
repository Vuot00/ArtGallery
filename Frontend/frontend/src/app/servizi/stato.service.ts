
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatoService {
  private _nuovoOrdine = new Subject<boolean>();

  // Observable che gli altri componenti possono sottoscrivere
  nuovoOrdine$ = this._nuovoOrdine.asObservable();

  // Metodo per notificare l'evento
  notificaNuovoOrdine() {
    this._nuovoOrdine.next(true);
  }
}
