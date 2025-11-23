import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../servizi/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toastService.isVisible()"
         class="toast-container"
         [ngClass]="toastService.type()"
         (click)="toastService.close()">

      <div class="icon">
        {{ toastService.type() === 'success' ? '✅' : (toastService.type() === 'error' ? '❌' : 'ℹ️') }}
      </div>

      <div class="message">
        {{ toastService.message() }}
      </div>

    </div>
  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  public toastService = inject(ToastService);
}
