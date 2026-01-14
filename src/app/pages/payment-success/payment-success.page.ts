import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
  template: `
    <ion-content [fullscreen]="true" class="success-content">
      <div class="success-container">
        <div class="success-animation">
          <div class="checkmark-circle">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>

        <div class="success-content-wrapper">
          <h1 class="success-title">{{ 'paymentSuccess.title' | translate }}</h1>
          <p class="success-subtitle">{{ 'paymentSuccess.subtitle' | translate }}</p>

          <div class="info-card">
            <div class="info-item">
              <div class="info-icon">📧</div>
              <div class="info-text">
                <h3>{{ 'paymentSuccess.emailNotificationTitle' | translate }}</h3>
                <p>{{ 'paymentSuccess.emailNotificationText' | translate }}</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">🔔</div>
              <div class="info-text">
                <h3>{{ 'paymentSuccess.reviewProcessTitle' | translate }}</h3>
                <p>{{ 'paymentSuccess.reviewProcessText' | translate }}</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">💡</div>
              <div class="info-text">
                <h3>{{ 'paymentSuccess.nextStepsTitle' | translate }}</h3>
                <p>{{ 'paymentSuccess.nextStepsText' | translate }}</p>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <ion-button (click)="goToHome()" class="btn-primary">
              {{ 'paymentSuccess.returnToHome' | translate }}
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .success-content {
      --background: #0a0a0a;
      --color: #fff;
    }

    .success-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      position: relative;
    }

    .success-animation {
      margin-bottom: 40px;
      animation: fadeInScale 0.6s ease-out;
    }

    .checkmark-circle {
      width: 120px;
      height: 120px;
      position: relative;
    }

    .checkmark {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: block;
      stroke-width: 3;
      stroke: var(--tesla-accent, #ffd700);
      stroke-miterlimit: 10;
      box-shadow: inset 0px 0px 0px var(--tesla-accent, #ffd700);
      animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
    }

    .checkmark-circle-bg {
      stroke: var(--tesla-accent, #ffd700);
      stroke-width: 3;
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes scale {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: scale3d(1.1, 1.1, 1);
      }
    }

    @keyframes fill {
      100% {
        box-shadow: inset 0px 0px 0px 30px var(--tesla-accent, #ffd700);
      }
    }

    .success-content-wrapper {
      max-width: 600px;
      width: 100%;
      text-align: center;
      animation: fadeInUp 0.8s ease-out 0.3s both;
    }

    .success-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: 4px;
      color: var(--tesla-accent, #ffd700);
      margin-bottom: 15px;
      text-transform: uppercase;
    }

    .success-subtitle {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 50px;
      letter-spacing: 1px;
    }

    .info-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 40px;
      backdrop-filter: blur(10px);
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 30px;
      text-align: left;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-icon {
      font-size: 2rem;
      flex-shrink: 0;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }

    .info-text h3 {
      font-size: 0.85rem;
      letter-spacing: 2px;
      color: var(--tesla-accent, #ffd700);
      margin-bottom: 8px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .info-text p {
      font-size: 0.9rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }

    .action-buttons {
      margin-top: 30px;
    }

    .btn-primary {
      --background: var(--tesla-accent, #ffd700);
      --color: #000;
      --border-radius: 8px;
      --padding-start: 30px;
      --padding-end: 30px;
      --padding-top: 18px;
      --padding-bottom: 18px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    }

    @media (max-width: 768px) {
      .success-title {
        font-size: 1.8rem;
        letter-spacing: 2px;
      }

      .success-subtitle {
        font-size: 1rem;
      }

      .info-card {
        padding: 20px;
      }

      .info-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
  `]
})
export class PaymentSuccessPage {
  private router = inject(Router);

  goToHome() {
    this.router.navigate(['/home']);
  }
}

