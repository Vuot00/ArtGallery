import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OperaService } from '../../../servizi/opera.service';


@Component({
  selector: 'app-carica-opera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carica-opera.component.html',
  styleUrl: './carica-opera.component.scss'
})
export class CaricaOperaComponent {

  private operaService = inject(OperaService);
  private router = inject(Router);


  opera = {
    titolo: '',
    descrizione: '',
    prezzo: 0,
    anno: new Date().getFullYear()
  };


  selectedFiles: File[] =[];
  previewUrls: string[] = [];


  onFileSelected(event: any) {
    if (event.target.files) {
      const files = Array.from(event.target.files) as File[];

      for (let file of files) {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }


  onSubmit() {
    if (this.selectedFiles.length === 0) {
      alert("Devi selezionare almeno un'immagine!");
      return;
    }

    console.log("Invio opera...", this.opera);
    console.log("Numero immagini:", this.selectedFiles.length);

    this.operaService.caricaOpera(this.opera, this.selectedFiles).subscribe({
      next: (res) => {
        alert("Opera e galleria caricate con successo!");
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error("Errore caricamento", err);
        // Mostra un messaggio più specifico se possibile
        const msg = err.error || "Errore durante il caricamento.";
        alert(msg);
      }
    });
  }
}
