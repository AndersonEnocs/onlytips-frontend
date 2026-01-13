import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ActionSheetController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { IIdea } from '../../../shared/interfaces/idea.interface';
import { IAdminStatistics } from '../../../shared/interfaces/admin-statistics.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [IonicModule, CommonModule],
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
        this.showErrorToast('Failed to load dashboard statistics');
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
        this.showErrorToast('Failed to load ideas');
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
    const actionSheet = await this.actionSheetCtrl.create({
      header: `DECISION FOR: ${idea.title.toUpperCase()}`,
      cssClass: 'tesla-action-sheet',
      buttons: [
        { text: 'SELECT IDEA', handler: () => this.promptFeedback(idea, 'SELECTED') },
        { text: 'REVIEWED', handler: () => this.promptFeedback(idea, 'REVIEWED') },
        { text: 'NOT SELECTED', role: 'destructive', handler: () => this.promptFeedback(idea, 'NOT_SELECTED') },
        { text: 'CANCEL', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async promptFeedback(idea: IIdea, status: string) {
    const alert = await this.alertCtrl.create({
      header: 'FEEDBACK REPORT',
      inputs: [{ name: 'feedback', type: 'textarea', placeholder: 'Enter human review feedback...' }],
      buttons: [
        { text: 'ABORT', role: 'cancel' },
        {
          text: 'CONFIRM DECISION',
          handler: (data) => {
            const loader = this.loadingCtrl.create({
              message: 'Processing decision...',
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
                this.showErrorToast('Failed to process decision');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Método para actualizar el fondo (Fund)
   */
  async updateFund() {
    const alert = await this.alertCtrl.create({
      header: 'UPDATE ONLYTIPS FUND',
      inputs: [
        { 
          name: 'amount', 
          type: 'number', 
          placeholder: 'New capital amount',
          value: this.fundTotal(),
          attributes: {
            min: '0',
            step: '0.01'
          }
        }
      ],
      buttons: [
        { text: 'CANCEL', role: 'cancel' },
        {
          text: 'UPDATE CORE',
          handler: (data): boolean => {
            const amount = parseFloat(data.amount);
            
            // Validación
            if (!data.amount || isNaN(amount) || amount < 0) {
              this.showErrorToast('Please enter a valid amount');
              return false;
            }

            // Mostrar loading
            const loader = this.loadingCtrl.create({
              message: 'Updating fund...',
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
                this.showSuccessToast('Fund updated successfully');
              },
              error: (err) => {
                loader.then(l => l.dismiss());
                console.error('Error updating fund:', err);
                this.showErrorToast(err.error?.message || 'Failed to update fund');
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