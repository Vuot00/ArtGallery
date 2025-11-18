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


  selectedFile: File | null = null;
  previewUrl: string | null = null;


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;


      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }


  onSubmit() {
    if (!this.selectedFile) {
      alert("Devi selezionare un'immagine!");
      return;
    }

    console.log("Invio opera...", this.opera);

    this.operaService.caricaOpera(this.opera, this.selectedFile).subscribe({
      next: (res) => {
        alert("Opera caricata con successo!");
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error("Errore caricamento", err);
        alert("Errore durante il caricamento.");
      }
    });
  }
}
