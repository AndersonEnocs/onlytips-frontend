import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { IPublicStatus } from '../shared/interfaces/public-status.interface';
import { SubmitIdeaModalComponent } from '../shared/components/submit-idea-modal/submit-idea-modal.component';
import { register } from 'swiper/element/bundle';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, CurrencyPipe, DatePipe, TranslateModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  public status = signal<IPublicStatus | null>(null);

  ngOnInit() {
    this.loadProjectStatus();
    register();
  }

  loadProjectStatus() {
    this.api.getProjectStatus().subscribe({
      next: (res) => this.status.set(res.data),
      error: (err) => console.error('Telemetry Error:', err)
    });
  }

  async openSubmitModal() {
    const modal = await this.modalCtrl.create({
      component: SubmitIdeaModalComponent,
      cssClass: 'tesla-modal-fullscreen', // Define esto en global.scss para que sea elegante
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    return await modal.present();
  }

  goToAdmin() {
    this.router.navigate(['/admin/login']);
  }
}
