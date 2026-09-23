import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRightOnRectangle,
  heroBanknotes,
  heroCalendarDays,
  heroChartBar,
  heroCheckCircle,
  heroClipboardDocumentList,
  heroClock,
  heroPlus,
  heroShieldCheck,
  heroSparkles,
  heroUser,
  heroUsers,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../core/services/auth.service';

interface ICateringOrderSummary {
  id: string;
  customerName: string;
  eventType: string;
  guestsCount: number;
  eventDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_preparation' | 'completed';
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [NgIcon],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroShieldCheck,
      heroUser,
      heroArrowRightOnRectangle,
      heroClipboardDocumentList,
      heroUsers,
      heroBanknotes,
      heroCalendarDays,
      heroPlus,
      heroSparkles,
      heroChartBar,
      heroCheckCircle,
      heroClock,
    }),
  ],
})
export class AdminDashboardComponent {
  #authService = inject(AuthService);
  #router = inject(Router);

  readonly currentUser = this.#authService.currentUser;

  readonly recentOrders = signal<ICateringOrderSummary[]>([

  ]);

  getStatusLabel(status: ICateringOrderSummary['status']): string {
    switch (status) {
      case 'confirmed':
        return 'Confermato';
      case 'pending':
        return 'In attesa';
      case 'in_preparation':
        return 'In preparazione';
      case 'completed':
        return 'Completato';
    }
  }

  getStatusBadgeClass(status: ICateringOrderSummary['status']): string {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'in_preparation':
        return 'badge-info';
      case 'completed':
        return 'badge-neutral';
    }
  }

  logout(): void {
    this.#authService.logout();
  }
}
