import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-content [fullscreen]="true">
      <div class="login-wrapper">
        <div class="login-card glass">
          <div class="nasa-logo">ADMIN ACCESS</div>
          <p class="instruction">IDENTIFICATION REQUIRED</p>

          <input type="password" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="doLogin()">

          <button class="btn-tesla" (click)="doLogin()">AUTHORIZE</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-wrapper {
      height: 100vh; display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at center, #111 0%, #000 100%);
    }
    .login-card {
      padding: 40px; width: 100%; max-width: 350px; text-align: center;
      border: 1px solid var(--tesla-border);
    }
    .nasa-logo { font-size: 1.2rem; letter-spacing: 5px; margin-bottom: 10px; font-weight: 800; }
    .instruction { font-size: 0.6rem; letter-spacing: 2px; color: #666; margin-bottom: 30px; }
    input {
      width: 100%; background: #000; border: 1px solid #333; padding: 15px;
      color: var(--tesla-accent); text-align: center; font-size: 1.2rem; margin-bottom: 20px;
      outline: none; transition: border 0.5s;
      &:focus { border-color: var(--tesla-accent); }
    }
    .btn-tesla { width: 100%; padding: 15px; }
  `]
})
export class LoginPage {
  password = '';
  private api = inject(ApiService);
  private nav = inject(NavController);
  private toast = inject(ToastController);

  async doLogin() {
    this.api.login(this.password).subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.data.access_token);
        this.nav.navigateRoot('/admin/dashboard');
      },
      error: async () => {
        const t = await this.toast.create({ message: 'ACCESS DENIED', duration: 2000, color: 'danger' });
        t.present();
      }
    });
  }
}