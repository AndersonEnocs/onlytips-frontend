import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-submit-idea-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>INITIATE SUBMISSION</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()" class="close-btn">CANCEL</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-container">
        <form [formGroup]="ideaForm" (ngSubmit)="onSubmit()">

          <div class="input-group">
            <label>PROJECT TITLE</label>
            <input formControlName="title" placeholder="Define your vision..." type="text">
          </div>

          <div class="input-group">
            <label>DESCRIPTION (Human readable)</label>
            <textarea formControlName="description" rows="6" placeholder="Details of the innovation..."></textarea>
          </div>

          <div class="input-group">
            <label>CONTACT EMAIL</label>
            <input formControlName="email" type="email" placeholder="communications@domain.com">
          </div>

          <div class="checkbox-group">
            <ion-checkbox formControlName="isPublic" justify="start">Publicly visible in Noosphere</ion-checkbox>
          </div>

          <button type="submit" [disabled]="!ideaForm.valid" class="btn-tesla-submit">
            RESERVE SLOT — $4.99
          </button>
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
    .btn-tesla-submit {
      width: 100%;
      background: var(--tesla-accent);
      color: #000;
      border: none;
      padding: 18px;
      font-weight: 800;
      letter-spacing: 3px;
      cursor: pointer;
      margin-top: 20px;
      transition: opacity 0.3s;
      &:disabled { opacity: 0.2; cursor: not-allowed; }
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

  public ideaForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    isPublic: [true]
  });

  async onSubmit() {
    if (this.ideaForm.invalid) return;

    const loader = await this.loadingCtrl.create({
      message: 'ESTABLISHING SECURE CONNECTION...',
      spinner: 'lines-sharp',
      cssClass: 'tesla-loader'
    });
    await loader.present();

    this.api.submitIdea(this.ideaForm.value).subscribe({
      next: (res) => {
        loader.dismiss();
        this.dismiss();
        // Redirección profesional a Stripe Checkout
        if (res.data.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        }
      },
      error: async (err) => {
        loader.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'TELEMETRY ERROR: Submission failed.',
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