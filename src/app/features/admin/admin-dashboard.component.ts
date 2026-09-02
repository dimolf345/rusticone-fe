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
    {
      id: 'RUST-2026-081',
      customerName: 'Mario Rossi',
      eventType: 'Festa di Laurea (Buffet Rustico)',
      guestsCount: 45,
      eventDate: '28 Ago 2026',
      totalAmount: 675,
      status: 'confirmed',
    },
    {
      id: 'RUST-2026-082',
      customerName: 'Azienda Innova SRL',
      eventType: 'Aperitivo Aziendale & Pizze Gourmet',
      guestsCount: 80,
      eventDate: '30 Ago 2026',
      totalAmount: 1450,
      status: 'pending',
    },
    {
      id: 'RUST-2026-083',
      customerName: 'Chiara Bianchi',
      eventType: 'Compleanno 18 Anni (Buffet Pizza & Fritti)',
      guestsCount: 60,
      eventDate: '02 Set 2026',
      totalAmount: 890,
      status: 'in_preparation',
    },
    {
      id: 'RUST-2026-084',
      customerName: 'Studio Legale Verdi',
      eventType: 'Coffee Break & Focacce Artigianali',
      guestsCount: 25,
      eventDate: '05 Set 2026',
      totalAmount: 380,
      status: 'pending',
    },
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
