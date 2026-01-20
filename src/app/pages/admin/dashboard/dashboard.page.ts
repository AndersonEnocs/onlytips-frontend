import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AlertController, ActionSheetController, NavController, LoadingController, ToastController, Platform } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { IIdea } from '../../../shared/interfaces/idea.interface';
import { IAdminStatistics } from '../../../shared/interfaces/admin-statistics.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  private api = inject(ApiService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private nav = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private platform = inject(Platform);
  private translate = inject(TranslateService);
  
  private isActionSheetOpening = false;

  // Signals para reactividad de alto nivel
  public ideas = signal<IIdea[]>([]);
  public currentStatus = signal('RECEIVED');
  public currentPage = signal(1);
  public paginationInfo = signal({
    total: 0,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Métricas del dashboard - inicializadas con valores por defecto
  public metrics = signal<IAdminStatistics>({
    totalIdeas: 0,
    pendingPayment: 0,
    received: 0,
    reviewed: 0,
    selected: 0,
    notSelected: 0
  });

  public isLoadingMetrics = signal(false);
  public fundTotal = signal(50000); // Este vendrá de otro endpoint si es necesario

  ngOnInit() {
    this.loadStatistics();
    this.loadIdeas();
  }

  /**
   * Carga las estadísticas del dashboard desde el backend
   */
  loadStatistics() {
    this.isLoadingMetrics.set(true);
    this.api.getAdminStatistics().subscribe({
      next: (response) => {
        if (response.data) {
          this.metrics.set(response.data);
        }
        this.isLoadingMetrics.set(false);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.isLoadingMetrics.set(false);
        this.showErrorToast(this.translate.instant('admin.dashboard.failedToLoadStats'));
      }
    });
  }

  /**
   * Carga las ideas según el estado y página actual
   */
  loadIdeas() {
    this.api.getAdminIdeas(this.currentPage(), this.currentStatus()).subscribe({
      next: (res) => {
        this.ideas.set(res.data.data || res.data);
        
        // Manejar información de paginación del backend
        if (res.data.pagination) {
          const pagination = res.data.pagination;
          this.paginationInfo.set({
            total: pagination.total || 0,
            limit: pagination.limit || 10,
            totalPages: pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
            hasNext: pagination.hasNext || false,
            hasPrevious: pagination.hasPrevious || false
          });
        } else {
          // Si no viene paginación, calcularla basándose en los datos
          const total = res.data.total || res.data.data?.length || 0;
          const limit = 10;
          const totalPages = Math.ceil(total / limit);
          this.paginationInfo.set({
            total: total,
            limit: limit,
            totalPages: totalPages,
            hasNext: this.currentPage() < totalPages,
            hasPrevious: this.currentPage() > 1
          });
        }
      },
      error: (err) => {
        console.error('Error loading ideas:', err);
        this.showErrorToast(this.translate.instant('admin.dashboard.failedToLoadIdeas'));
      }
    });
  }

  nextPage() {
    if (this.paginationInfo().hasNext) {
      this.currentPage.update(page => page + 1);
      this.loadIdeas();
    }
  }

  previousPage() {
    if (this.paginationInfo().hasPrevious) {
      this.currentPage.update(page => page - 1);
      this.loadIdeas();
    }
  }

  onStatusChange(status: string) {
    this.currentStatus.set(status);
    this.currentPage.set(1); // Reset a página 1 cuando cambia el filtro
    this.loadIdeas();
  }

  async openDecisionMenu(idea: IIdea) {
    // Prevenir múltiples aperturas simultáneas
    if (this.isActionSheetOpening) {
      console.warn('Action sheet is already opening, please wait...');
      return;
    }

    this.isActionSheetOpening = true;

    // Timeout de seguridad para resetear el flag
    const safetyTimeout = setTimeout(() => {
      if (this.isActionSheetOpening) {
        console.warn('Action sheet opening timeout - resetting flag');
        this.isActionSheetOpening = false;
      }
    }, 10000);

    try {
      // En web, asegurar que Ionic esté inicializado
      if (this.platform.is('hybrid')) {
        await this.platform.ready();
      }

      // Verificar que el ActionSheetController esté disponible
      if (!this.actionSheetCtrl) {
        throw new Error('ActionSheetController is not available');
      }

      // Pequeño delay para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 50));

      const actionSheet = await this.actionSheetCtrl.create({
        header: this.translate.instant('admin.dashboard.decisionFor', { title: idea.title.toUpperCase() }),
        cssClass: 'tesla-action-sheet',
        buttons: [
          { text: this.translate.instant('admin.dashboard.selectIdea'), handler: () => this.promptFeedback(idea, 'SELECTED') },
          { text: this.translate.instant('admin.dashboard.reviewedLabel'), handler: () => this.promptFeedback(idea, 'REVIEWED') },
          { text: this.translate.instant('admin.dashboard.notSelectedLabel2'), role: 'destructive', handler: () => this.promptFeedback(idea, 'NOT_SELECTED') },
          { text: this.translate.instant('admin.dashboard.cancel'), role: 'cancel' }
        ]
      });

      if (!actionSheet) {
        throw new Error('Failed to create action sheet instance');
      }

      // Verificar que el action sheet tenga el método present
      if (typeof actionSheet.present !== 'function') {
        throw new Error('ActionSheet instance is invalid - present method not found');
      }

      await actionSheet.present();
      clearTimeout(safetyTimeout);

      // Resetear el flag cuando el action sheet se cierre
      actionSheet.onDidDismiss().finally(() => {
        this.isActionSheetOpening = false;
      });
    } catch (error) {
      clearTimeout(safetyTimeout);
      this.isActionSheetOpening = false;
      console.error('❌ Error opening action sheet:', error);
      
      // Log detallado para debugging en producción
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          platform: this.platform.platforms(),
          isHybrid: this.platform.is('hybrid'),
          isWeb: this.platform.is('pwa') || this.platform.is('desktop'),
          actionSheetCtrlAvailable: !!this.actionSheetCtrl,
          errorName: error.name
        });
      }

      // Mostrar error al usuario
      this.showErrorToast(this.translate.instant('admin.dashboard.errorOpeningMenu'));
    }
  }

  async promptFeedback(idea: IIdea, status: string) {
    try {
      // En web, asegurar que Ionic esté inicializado
      if (this.platform.is('hybrid')) {
        await this.platform.ready();
      }

      // Verificar que el AlertController esté disponible
      if (!this.alertCtrl) {
        throw new Error('AlertController is not available');
      }

      // Pequeño delay para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 50));

      const alert = await this.alertCtrl.create({
        header: this.translate.instant('admin.dashboard.feedbackReport'),
        inputs: [{ name: 'feedback', type: 'textarea', placeholder: this.translate.instant('admin.dashboard.feedbackPlaceholder') }],
        buttons: [
          { text: this.translate.instant('admin.dashboard.abort'), role: 'cancel' },
          {
            text: this.translate.instant('admin.dashboard.confirmDecision'),
            handler: (data) => {
              const loader = this.loadingCtrl.create({
                message: this.translate.instant('admin.dashboard.processingDecision'),
                spinner: 'lines-sharp'
              });
              
              loader.then(l => l.present());
              
              this.api.makeDecision(idea.id, { status, feedback: data.feedback }).subscribe({
                next: () => {
                  loader.then(l => l.dismiss());
                  // Si se eliminó la idea de la página actual y quedó vacía, volver a página anterior
                  if (this.ideas().length === 1 && this.currentPage() > 1) {
                    this.currentPage.update(page => page - 1);
                  }
                  // Recargar tanto ideas como estadísticas para reflejar cambios
                  this.loadIdeas();
                  this.loadStatistics();
                },
                error: (err) => {
                  loader.then(l => l.dismiss());
                  console.error('Error making decision:', err);
                  this.showErrorToast(this.translate.instant('admin.dashboard.failedToProcessDecision'));
                }
              });
            }
          }
        ]
      });

      if (!alert) {
        throw new Error('Failed to create alert instance');
      }

      await alert.present();
    } catch (error) {
      console.error('Error opening feedback prompt:', error);
      this.showErrorToast(this.translate.instant('admin.dashboard.errorOpeningFeedback'));
    }
  }

  /**
   * Método para actualizar el fondo (Fund)
   */
  async updateFund() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('admin.dashboard.updateFund'),
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: this.translate.instant('admin.dashboard.newAmountPlaceholder'),
          value: this.fundTotal(),
          attributes: {
            min: '0',
            step: '0.01'
          }
        }
      ],
      buttons: [
        { text: this.translate.instant('admin.dashboard.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('admin.dashboard.updateCore'),
          handler: (data): boolean => {
            const amount = parseFloat(data.amount);

            // Validación
            if (!data.amount || isNaN(amount) || amount < 0) {
              this.showErrorToast(this.translate.instant('admin.dashboard.validAmountRequired'));
              return false;
            }

            // Mostrar loading
            const loader = this.loadingCtrl.create({
              message: this.translate.instant('admin.dashboard.updatingFund'),
              spinner: 'lines-sharp'
            });
            
            loader.then(l => l.present());

            // Llamada al endpoint (asíncrona, no bloquea el cierre del alert)
            this.api.updateFund(amount).subscribe({
              next: (response) => {
                loader.then(l => l.dismiss());
                
                // Actualizar el signal con el nuevo valor
                if (response.data?.amount !== undefined) {
                  this.fundTotal.set(response.data.amount);
                } else {
                  this.fundTotal.set(amount);
                }
                
                // Mostrar éxito
                this.showSuccessToast(this.translate.instant('admin.dashboard.fundUpdated'));
              },
              error: (err) => {
                loader.then(l => l.dismiss());
                console.error('Error updating fund:', err);
                this.showErrorToast(err.error?.message || this.translate.instant('admin.dashboard.failedToUpdateFund'));
              }
            });

            // Retornar true para permitir que el alert se cierre inmediatamente
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Muestra un toast de error
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Muestra un toast de éxito
   */
  private async showSuccessToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  logout() {
    localStorage.removeItem('access_token');
    this.nav.navigateRoot('/admin/login');
  }
}