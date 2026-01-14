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
        <div class="back-button-container">
          <ion-button fill="clear" class="btn-back" (click)="goBack()">
            <ion-icon name="arrow-back-outline" slot="start"></ion-icon>
            BACK
          </ion-button>
        </div>
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
      height: 100vh; 
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center;
      background: radial-gradient(circle at center, #111 0%, #000 100%);
      position: relative;
    }
    
    .back-button-container {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 10;
    }
    
    .btn-back {
      --color: var(--tesla-accent);
      --background: transparent;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.3s ease;
      
      &:hover {
        --color: #fff;
        transform: translateX(-5px);
      }
      
      ion-icon {
        font-size: 1.2rem;
      }
    }
    
    .login-card {
      padding: 40px; 
      width: 100%; 
      max-width: 350px; 
      text-align: center;
      border: 1px solid var(--tesla-border);
    }
    
    .nasa-logo { 
      font-size: 1.2rem; 
      letter-spacing: 5px; 
      margin-bottom: 10px; 
      font-weight: 800; 
    }
    
    .instruction { 
      font-size: 0.6rem; 
      letter-spacing: 2px; 
      color: #666; 
      margin-bottom: 30px; 
    }
    
    input {
      width: 100%; 
      background: #000; 
      border: 1px solid #333; 
      padding: 15px;
      color: var(--tesla-accent); 
      text-align: center; 
      font-size: 1.2rem; 
      margin-bottom: 20px;
      outline: none; 
      transition: border 0.5s;
      &:focus { 
        border-color: var(--tesla-accent); 
      }
    }
    
    .btn-tesla { 
      width: 100%; 
      padding: 15px; 
    }
    
    @media (max-width: 768px) {
      .back-button-container {
        top: 15px;
        left: 15px;
      }
      
      .btn-back {
        font-size: 0.7rem;
        padding: 8px 12px;
      }
    }
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

  goBack() {
    this.nav.navigateBack('/home');
  }
}