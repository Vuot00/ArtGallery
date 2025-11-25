import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../servizi/user.service';
import { OperaService } from '../../servizi/opera.service';

@Component({
  selector: 'app-profilo-pubblico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profilo-pubblico.component.html',
  styleUrl: './profilo-pubblico.component.scss' // UsiamoProfilo Privato
})
export class ProfiloPubblicoComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private operaService = inject(OperaService);

  artista: any = null;
  opere: any[] = [];
  loading = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.caricaDati(id);
    }
  }

  caricaDati(id: number) {
    this.userService.getProfiloPubblico(id).subscribe({
      next: (res) => {
        this.artista = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.operaService.getOpereByArtistaId(id).subscribe({
      next: (res) => this.opere = res
    });
  }
}
