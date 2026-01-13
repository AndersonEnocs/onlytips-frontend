import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PaymentMethod } from '../../../shared/interfaces/idea.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-submit-idea-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ 'submitIdea.title' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()" class="close-btn">{{ 'submitIdea.cancel' | translate }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-container">
        <form [formGroup]="ideaForm">

          <div class="input-group">
            <label>{{ 'submitIdea.projectTitle' | translate }}</label>
            <input formControlName="title" [placeholder]="'submitIdea.projectTitlePlaceholder' | translate" type="text">
          </div>

          <div class="input-group">
            <label>{{ 'submitIdea.description' | translate }}</label>
            <textarea formControlName="description" rows="6" [placeholder]="'submitIdea.descriptionPlaceholder' | translate"></textarea>
          </div>

          <div class="input-group">
            <label>{{ 'submitIdea.contactEmail' | translate }}</label>
            <input formControlName="email" type="email" [placeholder]="'submitIdea.emailPlaceholder' | translate">
          </div>

          <div class="checkbox-group">
            <ion-checkbox formControlName="isPublic" justify="start">{{ 'submitIdea.isPublic' | translate }}</ion-checkbox>
          </div>

          <div class="payment-buttons">
            <button type="button" [disabled]="!ideaForm.valid" (click)="onSubmit(PaymentMethod.STRIPE)" class="btn-tesla-stripe">
              <span class="btn-icon">💳</span>
              {{ 'submitIdea.payWithStripe' | translate }}
            </button>
            
            <button type="button" [disabled]="!ideaForm.valid" (click)="onSubmit(PaymentMethod.PAYPAL)" class="btn-tesla-paypal">
              <span class="btn-icon">💳</span>
              {{ 'submitIdea.payWithPaypal' | translate }}
            </button>
            
            <button type="button" [disabled]="!ideaForm.valid" (click)="onSubmit(PaymentMethod.APPLE_PAY)" class="btn-tesla-apple">
              <span class="btn-icon">🍎</span>
              {{ 'submitIdea.payWithApplePay' | translate }}
            </button>
          </div>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      --ion-background-color: #0a0a0a;
    }
    ion-toolbar {
      --background: #0a0a0a;
      --color: #fff;
      --border-color: var(--tesla-border);
      letter-spacing: 2px;
      font-size: 0.8rem;
    }
    .form-container {
      max-width: 500px;
      margin: 0 auto;
      padding-top: 20px;
    }
    .input-group {
      margin-bottom: 25px;
      label {
        display: block;
        font-size: 0.65rem;
        letter-spacing: 2px;
        color: var(--tesla-accent);
        margin-bottom: 8px;
        font-weight: 600;
      }
      input, textarea {
        width: 100%;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 15px;
        color: #fff;
        font-family: 'Inter', sans-serif;
        outline: none;
        transition: border 0.3s ease;
        &:focus { border-color: var(--tesla-accent); }
      }
    }
    .payment-buttons {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .btn-tesla-stripe,
    .btn-tesla-paypal,
    .btn-tesla-apple {
      width: 100%;
      border: none;
      padding: 18px;
      font-weight: 800;
      letter-spacing: 3px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      &:disabled { 
        opacity: 0.2; 
        cursor: not-allowed; 
      }
      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      &:not(:disabled):active {
        transform: translateY(0);
      }
    }
    
    .btn-tesla-stripe {
      background: linear-gradient(135deg, #635bff 0%, #0a2540 100%);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .btn-tesla-paypal {
      background: linear-gradient(135deg, #0070ba 0%, #003087 100%);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .btn-tesla-apple {
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .btn-icon {
      font-size: 1.2rem;
      line-height: 1;
    }
    ion-checkbox {
      --size: 18px;
      --checkbox-background-checked: var(--tesla-accent);
      --border-color: var(--tesla-accent);
      font-size: 0.75rem;
      color: #888;
    }
  `]
})
export class SubmitIdeaModalComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private modalCtrl = inject(ModalController);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private translate = inject(TranslateService);
  
  PaymentMethod = PaymentMethod;

  public ideaForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    isPublic: [true]
  });

  async onSubmit(paymentMethod: PaymentMethod) {
    if (this.ideaForm.invalid) return;

    const loadingMessage = this.translate.instant('submitIdea.loadingMessage');
    const loader = await this.loadingCtrl.create({
      message: loadingMessage,
      spinner: 'lines-sharp',
      cssClass: 'tesla-loader'
    });
    await loader.present();

    const formData = {
      ...this.ideaForm.value,
      paymentMethod: paymentMethod
    };

    this.api.submitIdea(formData).subscribe({
      next: (res) => {
        loader.dismiss();
        this.dismiss();
        // Redirección profesional al método de pago seleccionado
        if (res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        }
      },
      error: async (err) => {
        loader.dismiss();
        const errorMessage = this.translate.instant('submitIdea.errorMessage');
        const toast = await this.toastCtrl.create({
          message: errorMessage,
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        toast.present();
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}