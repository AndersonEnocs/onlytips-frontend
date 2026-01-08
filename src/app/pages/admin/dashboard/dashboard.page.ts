import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ActionSheetController, NavController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { IIdea } from '../../../shared/interfaces/idea.interface';

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

  // Signals para reactividad de alto nivel
  public ideas = signal<IIdea[]>([]);
  public currentStatus = signal('RECEIVED');

  ngOnInit() {
    this.loadIdeas();
  }

  loadIdeas() {
    this.api.getAdminIdeas(1, this.currentStatus()).subscribe(res => {
      this.ideas.set(res.data.data);
    });
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
            this.api.makeDecision(idea.id, { status, feedback: data.feedback }).subscribe(() => this.loadIdeas());
          }
        }
      ]
    });
    await alert.present();
  }

  // Método para actualizar el fondo (Fund)
  async updateFund() {
    const alert = await this.alertCtrl.create({
      header: 'UPDATE ONLYTIPS FUND',
      inputs: [{ name: 'amount', type: 'number', placeholder: 'New capital amount' }],
      buttons: [
        { text: 'CANCEL', role: 'cancel' },
        {
          text: 'UPDATE CORE',
          handler: (data) => {
            // Llamada al endpoint de settings/fund
            this.loadIdeas(); // Recargar para ver cambios
          }
        }
      ]
    });
    await alert.present();
  }

  logout() {
    localStorage.removeItem('access_token');
    this.nav.navigateRoot('/admin/login');
  }
}