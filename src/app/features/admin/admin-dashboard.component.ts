import {
  ChangeDetectionStrategy,
  Component,
  inject
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

  logout(): void {
    this.#authService.logout();
  }
}
