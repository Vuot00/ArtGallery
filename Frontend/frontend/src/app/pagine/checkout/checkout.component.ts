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
        this.initConfig();
      },
      error: () => this.toastService.show("Errore caricamento opera", "error")
    });
  }

  private initConfig(): void {
    const token = this.authService.getToken();

    // Creiamo gli header manuali
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AXcPgepTxPSfzaB14MMFT6SqByOWh3Dm6wUuUhzTh81iMWwZRKE-P23vyoHvIJd2nz8kW2FZUqQLGKwU',

      createOrderOnServer: (data) => {
        return fetch(`http://localhost:8080/api/pagamenti/create/${this.idOpera}`, {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then((res) => res.json())
          .then((order) => order.id);
      },

      onApprove: (data, actions) => {
        console.log('Transazione approvata. Catturo...');

        this.http.post(`http://localhost:8080/api/pagamenti/capture/${data.orderID}`, {}, { headers, responseType: 'text' })
          .subscribe({
            next: (res) => {
              this.toastService.show("Pagamento completato! L'opera è tua.", "success");
              this.router.navigate(['/profilo']); // O dove preferisci
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
