import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController, Platform, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { IPublicStatus } from '../shared/interfaces/public-status.interface';
import { register } from 'swiper/element/bundle';
import { TranslateModule } from '@ngx-translate/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

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
  private platform = inject(Platform);
  private toastCtrl = inject(ToastController);

  public status = signal<IPublicStatus | null>(null);
  private isModalOpening = false;

  ngOnInit() {
    this.loadProjectStatus();
    register();
    this.initializeStatusBar();
  }

  private async initializeStatusBar() {
    // Solo ejecutar en dispositivos nativos
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.warn('StatusBar plugin not available:', error);
      }
    }
  }

  loadProjectStatus() {
    this.api.getProjectStatus().subscribe({
      next: (res) => this.status.set(res.data),
      error: (err) => console.error('Telemetry Error:', err)
    });
  }

  async openSubmitModal(): Promise<any> {
    // Prevenir múltiples aperturas simultáneas
    if (this.isModalOpening) {
      console.warn('Modal is already opening, please wait...');
      return null;
    }

    this.isModalOpening = true;

    // Timeout de seguridad para resetear el flag si algo falla
    const safetyTimeout = setTimeout(() => {
      if (this.isModalOpening) {
        console.warn('Modal opening timeout - resetting flag');
        this.isModalOpening = false;
      }
    }, 10000);

    try {
      // En web, asegurar que Ionic esté inicializado
      if (this.platform.is('hybrid')) {
        await this.platform.ready();
      }

      // Verificar que el ModalController esté disponible
      if (!this.modalCtrl) {
        throw new Error('ModalController is not available');
      }

      // CRÍTICO PARA PRODUCCIÓN: Import dinámico del componente
      // Esto asegura que el componente esté cargado antes de crear el modal
      const { SubmitIdeaModalV2Component: ModalComponent } = await import(
        '../shared/components/submit-idea-modal-v2/submit-idea-modal-v2.component'
      );

      if (!ModalComponent) {
        throw new Error('SubmitIdeaModalV2Component failed to load');
      }

      // Pequeño delay para asegurar que Angular haya procesado la importación
      await new Promise(resolve => setTimeout(resolve, 50));

      // Crear el modal con la configuración óptima para web
      const modal = await this.modalCtrl.create({
        component: ModalComponent,
        cssClass: 'tesla-modal-fullscreen',
        showBackdrop: true,
        backdropDismiss: true,
        keyboardClose: true,
        animated: true,
        mode: this.platform.is('ios') ? 'ios' : 'md',
        // Para web, no necesitamos presentingElement
        ...(this.platform.is('hybrid') ? {} : { presentingElement: undefined })
      });

      if (!modal) {
        throw new Error('Failed to create modal instance');
      }

      // Verificar que el modal se creó correctamente antes de presentar
      if (typeof modal.present !== 'function') {
        throw new Error('Modal instance is invalid - present method not found');
      }

      // Presentar el modal
      await modal.present();
      clearTimeout(safetyTimeout);

      // Resetear el flag cuando el modal se cierre
      modal.onDidDismiss().finally(() => {
        this.isModalOpening = false;
      });

      return modal;
    } catch (error) {
      clearTimeout(safetyTimeout);
      this.isModalOpening = false;
      
      console.error('❌ Error opening modal:', error);
      
      // Log detallado para debugging en producción
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          platform: this.platform.platforms(),
          isHybrid: this.platform.is('hybrid'),
          isWeb: this.platform.is('pwa') || this.platform.is('desktop'),
          modalCtrlAvailable: !!this.modalCtrl,
          modalCtrlType: typeof this.modalCtrl,
          errorName: error.name
        });
      }

      // Mostrar error al usuario con mensaje claro
      try {
        const toast = await this.toastCtrl.create({
          message: 'Error al abrir el formulario. Por favor, intenta de nuevo.',
          duration: 3000,
          color: 'danger',
          position: 'bottom',
          buttons: [
            {
              text: 'Reintentar',
              handler: () => {
                // Reintentar después de un pequeño delay
                setTimeout(() => {
                  this.openSubmitModal();
                }, 500);
              }
            }
          ]
        });
        await toast.present();
      } catch (toastError) {
        console.error('Could not show error toast:', toastError);
        // Fallback: usar alert nativo del navegador
        alert('Error al abrir el formulario. Por favor, recarga la página.');
      }

      return null;
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin/login']);
  }
}
