import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonContent, IonButtons, IonButton, 
  IonIcon, IonList, IonItem, IonInput, IonTextarea, IonLabel, IonNote,
  IonSpinner, IonCard, IonCardContent, IonProgressBar, ModalController,
  LoadingController, ToastController 
} from '@ionic/angular/standalone';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  bulbOutline, close, warning, cardOutline, 
  logoPaypal, logoApple, chevronForward, alertCircleOutline, personOutline, cashOutline, informationCircleOutline } from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';

interface PaymentMethodType {
  STRIPE: 'stripe';
  PAYPAL: 'paypal';
  APPLE_PAY: 'apple_pay';
}

const PAYMENT_METHODS: PaymentMethodType = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay'
} as const;

@Component({
  selector: 'app-submit-idea-modal-v2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    IonHeader, IonToolbar, IonContent, IonButtons, IonButton, 
    IonIcon, IonItem, IonInput, IonTextarea, IonNote,
    IonSpinner, IonCard, IonCardContent, IonProgressBar
  ],
  templateUrl: './submit-idea-modal-v2.component.html',
  styleUrls: ['./submit-idea-modal-v2.component.scss']
})
export class SubmitIdeaModalV2Component implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly modalCtrl = inject(ModalController);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  private readonly translate = inject(TranslateService);
  private readonly api = inject(ApiService);

  readonly PAYMENT_METHODS = PAYMENT_METHODS;
  readonly isSubmitting = signal(false);
  readonly selectedPaymentMethod = signal<string | null>(null);
  readonly checkoutUrl = signal<string | null>(null);
  readonly formErrors = signal<string[]>([]);
  readonly maxFundingLimit = signal<number>(10000);

  ideaForm!: FormGroup;

  constructor() {
    addIcons({bulbOutline,close,alertCircleOutline,personOutline,cashOutline,informationCircleOutline,cardOutline,logoPaypal,logoApple,warning,chevronForward});
  }

  ngOnInit(): void {
    this.loadFundingLimit();
    this.initializeForm();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadFundingLimit(): Promise<void> {
    try {
      const response = await this.api.getProjectStatus().toPromise();
      if (response?.data?.fundTotal) {
        this.maxFundingLimit.set(response.data.fundTotal);
        this.updateFundingGoalValidator();
      }
    } catch (error) {
      console.warn('Could not load funding limit, using default:', error);
    }
  }

  private updateFundingGoalValidator(): void {
    const fundingGoalControl = this.ideaForm.get('fundingGoal');
    if (fundingGoalControl) {
      const currentValidators = [
        Validators.required,
        Validators.min(1),
        Validators.max(this.maxFundingLimit())
      ];
      fundingGoalControl.setValidators(currentValidators);
      fundingGoalControl.updateValueAndValidity();
    }
  }

  private initializeForm(): void {
    this.ideaForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        this.noEmptySpacesValidator
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.emailDomainValidator
      ]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.noEmptySpacesValidator
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.noEmptySpacesValidator
      ]],
      phoneNumber: ['', [
        Validators.required,
        this.phoneNumberValidator
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      fundingGoal: [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.maxFundingLimit())
      ]]
    });
  }

  private setupFormValidation(): void {
    this.ideaForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.ideaForm.dirty || this.ideaForm.touched) {
          this.updateFormErrors();
        }
      });
  }

  private updateFormErrors(): void {
    const errors: string[] = [];
    Object.keys(this.ideaForm.controls).forEach(key => {
      const control = this.ideaForm.get(key);
      if (control?.errors && control.touched) {
      }
    });
    this.formErrors.set(errors);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ideaForm?.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.ideaForm?.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    const errorKey = Object.keys(field.errors)[0];
    const messages: Record<string, any> = {
      required: `submitIdea.errors.${fieldName}Required`,
      minlength: `submitIdea.errors.${fieldName}MinLength`,
      maxlength: `submitIdea.errors.${fieldName}MaxLength`,
      email: 'submitIdea.errors.emailInvalid',
      noEmptySpaces: 'submitIdea.errors.noEmptySpaces',
      invalidDomain: 'submitIdea.errors.emailInvalidDomain',
      invalidPhoneFormat: 'submitIdea.errors.phoneNumberInvalid',
      min: 'submitIdea.errors.fundingGoalMin'
    };

    if (errorKey === 'max' && fieldName === 'fundingGoal') {
      return this.translate.instant('submitIdea.errors.fundingGoalMax', {
        limit: this.maxFundingLimit().toLocaleString()
      });
    }

    return messages[errorKey] || 'Campo inválido';
  }

  private noEmptySpacesValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return control.value.trim() !== control.value ? { noEmptySpaces: true } : null;
  }

  private emailDomainValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const email = control.value.toLowerCase();
    const blockedDomains = ['10minutemail.com', 'temp-mail.org'];
    if (!email.includes('@')) return null;
    const domain = email.split('@')[1];
    return blockedDomains.includes(domain) ? { invalidDomain: true } : null;
  }

  private phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const cleanPhone = control.value.replace(/[^\d+]/g, '');

    const phoneRegex = /^\+?[1-9]\d{6,14}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return { invalidPhoneFormat: true };
    }

    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return { invalidPhoneFormat: true };
    }

    return null;
  }

  async onSubmit(paymentMethod: string): Promise<void> {
    if (this.ideaForm.invalid) {
      this.ideaForm.markAllAsTouched();
      this.updateFormErrors();
      return;
    }

    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.selectedPaymentMethod.set(paymentMethod);

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('submitIdea.processing'),
      spinner: 'lines-sharp',
      cssClass: 'tesla-loading'
    });
    await loading.present();

    try {
      const formData = {
        ...this.ideaForm.value,
        paymentMethod: paymentMethod.toUpperCase(),
        isPublic: true,
        fundingGoal: Number(this.ideaForm.value.fundingGoal)
      };

      const response = await this.api.submitIdea(formData).toPromise();

      if (response?.data?.checkoutUrl) {
        this.checkoutUrl.set(response.data.checkoutUrl);
        setTimeout(() => {
          loading.dismiss();
          window.open(this.checkoutUrl()!, '_blank', 'noopener,noreferrer');
          this.dismiss(); 
        }, 1000);
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error: any) {
      await loading.dismiss();
      console.error('Submission error:', error);
      
      const toast = await this.toastCtrl.create({
        message: error.error?.message || 'Error al procesar la solicitud',
        duration: 4000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
      await toast.present();
    } finally {
      this.isSubmitting.set(false);
      this.selectedPaymentMethod.set(null);
    }
  }

  dismiss(): void {
    if (!this.isSubmitting()) {
      this.modalCtrl.dismiss();
    }
  }
}