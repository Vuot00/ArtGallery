import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IPayPalConfig, ICreateOrderRequest, NgxPayPalModule } from 'ngx-paypal';
import { ToastService } from '../../servizi/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, NgxPayPalModule], // <--- Importa NgxPayPalModule
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public payPalConfig?: IPayPalConfig;

  // Dati dell'opera che stiamo comprando
  opera: any = null;
  idOpera!: number;

  ngOnInit(): void {
    // 1. Recupera l'ID dell'opera dall'URL
    this.idOpera = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Scarica i dettagli dell'opera (per mostrare prezzo e titolo)
    this.caricaDettagliOpera();
  }

  caricaDettagliOpera() {
    // (Usa il tuo OperaService o http diretto per brevità)
    this.http.get(`http://localhost:8080/api/opere/${this.idOpera}`).subscribe({
      next: (res: any) => {
        this.opera = res;
        // 3. Solo quando abbiamo l'opera (e il prezzo), inizializziamo PayPal
        this.initConfig();
      },
      error: () => this.toastService.show("Errore caricamento opera", "error")
    });
  }

  private initConfig(): void {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AXcPgepTxPSfzaB14MMFT6SqByOWh3Dm6wUuUhzTh81iMWwZRKE-P23vyoHvIJd2nz8kW2FZUqQLGKwU',

      // A. CREAZIONE ORDINE (Lato Server)
      createOrderOnServer: (data) => {
        return fetch(`http://localhost:8080/api/pagamenti/create/${this.idOpera}`, {
          method: 'post',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((order) => order.id); // Ritorna l'ID di PayPal generato dal tuo backend
      },

      // B. CATTURA PAGAMENTO (Lato Server)
      onApprove: (data, actions) => {
        console.log('Transazione approvata da PayPal. Catturo...');

        this.http.post(`http://localhost:8080/api/pagamenti/capture/${data.orderID}`, {}, { headers, responseType: 'text' })
          .subscribe({
            next: (res) => {
              this.toastService.show("Pagamento completato! L'opera è tua.", "success");
              this.router.navigate(['/profilo']); // Vai agli acquisti
            },
            error: (err) => {
              this.toastService.show("Errore nella cattura del pagamento", "error");
            }
          });
      },

      onCancel: (data, actions) => {
        console.log('Pagamento annullato');
        this.toastService.show("Hai annullato il pagamento", "info");
      },

      onError: err => {
        console.log('Errore Tecnico PayPal', err);
        this.toastService.show("Errore tecnico PayPal", "error");
      },

      onClick: (data, actions) => {
        console.log('Bottone cliccato');
      }
    };
  }
}
