import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IPayPalConfig, NgxPayPalModule } from 'ngx-paypal';
import { ToastService } from '../../servizi/toast.service';
import { AuthService } from '../../servizi/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, NgxPayPalModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  public payPalConfig?: IPayPalConfig;

  // Dati dell'opera che stiamo comprando
  opera: any = null;
  idOpera!: number;

  ngOnInit(): void {
    this.idOpera = Number(this.route.snapshot.paramMap.get('id'));
    this.caricaDettagliOpera();
  }

  caricaDettagliOpera() {
    this.http.get(`http://localhost:8080/api/opere/${this.idOpera}`).subscribe({
      next: (res: any) => {
        this.opera = res;
        this.initConfig(); //per inizializzare il bottone PayPal
      },
      error: () => this.toastService.show("Errore caricamento opera", "error")
    });
  }

  //si puo dire sia la parte piu importante del codice
  private initConfig(): void {
    const token = this.authService.getToken();

    // Creiamo gli header manuali
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AXcPgepTxPSfzaB14MMFT6SqByOWh3Dm6wUuUhzTh81iMWwZRKE-P23vyoHvIJd2nz8kW2FZUqQLGKwU',

      //non creo l'ordine qui in JavaScript (sarebbe insicuro perché l'utente potrebbe modificare il prezzo con 'Ispeziona Elemento')
      createOrderOnServer: (data) => {
        return fetch(`http://localhost:8080/api/pagamenti/create/${this.idOpera}`, {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${token}`//passo l'header token perché il backend deve sapere chi sta comprando.
          }
        })

            //Il backend risponde con un ID ordine di PayPal, che io passo alla libreria ngx-paypal per aprire il popup di pagamento.
            .then((res) => res.json())
            .then((order) => order.id);
      },

      onApprove: (data, actions) => {
        console.log('Transazione approvata. Catturo...');
        //chiamiamo l'endpoint Java /api/pagamenti/... e il backend che finalizza la transazione, sposta i soldi e aggiorna il database.
        this.http.post(`http://localhost:8080/api/pagamenti/capture/${data.orderID}`, {}, { headers, responseType: 'text' })
            .subscribe({
              next: (res) => {
                this.toastService.show("Pagamento completato! L'opera è tua.", "success");//Se tutto va bene, mostro un messaggio di successo
                this.router.navigate(['/profilo']);
              },
              error: (err) => {
                this.toastService.show("Errore nella cattura del pagamento", "error");
              }
            });
      },

      onCancel: (data, actions) => {
        console.log('L\'utente ha chiuso la finestra di PayPal:', data);

        this.http.post(`http://localhost:8080/api/pagamenti/cancel/${data.orderID}`, {}, { headers, responseType: 'text' })
            .subscribe({
              next: (res) => {
                console.log("Opera sbloccata nel backend.");
                this.toastService.show("Pagamento annullato, l'opera è di nuovo disponibile.", "info");

                // this.router.navigate(['/home']);
              },
              error: (err) => {
                console.error("Impossibile sbloccare l'opera", err);
              }
            });
      },

      onError: err => {
        console.log('Errore Tecnico PayPal', err);
        this.toastService.show("Errore tecnico nel caricamento di PayPal", "error");
      },

      onClick: (data, actions) => {
        console.log('Apertura popup PayPal...');
      }
    };
  }
}