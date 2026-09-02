import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRight,
  heroArrowRightOnRectangle,
  heroCalendarDays,
  heroChatBubbleLeftRight,
  heroCheckCircle,
  heroClipboardDocumentList,
  heroClock,
  heroPlus,
  heroSparkles,
  heroUser,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../core/services/auth.service';

interface ICustomerQuoteRequest {
  id: string;
  packageTitle: string;
  guestCount: number;
  date: string;
  status: 'draft' | 'under_review' | 'confirmed';
  estimatedCost: number;
}

interface IBuffetPackageShowcase {
  id: string;
  title: string;
  description: string;
  pricePerPerson: number;
  highlights: string[];
  popular?: boolean;
}

@Component({
  selector: 'app-customer-dashboard',
  imports: [NgIcon],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroUser,
      heroArrowRightOnRectangle,
      heroSparkles,
      heroClipboardDocumentList,
      heroPlus,
      heroArrowRight,
      heroCalendarDays,
      heroClock,
      heroCheckCircle,
      heroChatBubbleLeftRight,
    }),
  ],
})
export class CustomerDashboardComponent {
  #authService = inject(AuthService);
  #router = inject(Router);

  readonly currentUser = this.#authService.currentUser;

  readonly activeQuotes = signal<ICustomerQuoteRequest[]>([
    {
      id: 'QUO-892',
      packageTitle: 'Buffet Compleanno & Pizze alla Pala',
      guestCount: 30,
      date: '12 Set 2026',
      status: 'under_review',
      estimatedCost: 450,
    },
  ]);

  readonly buffetPackages = signal<IBuffetPackageShowcase[]>([
    {
      id: 'pkg-rustico',
      title: 'Buffet Classico Rusticone',
      description: 'Pizze tonde e in teglia assortite, arancini mignon, panzerottini e focacce pugliesi.',
      pricePerPerson: 14,
      highlights: ['Pizze in teglia alta idratazione', 'Frittini caldi artigianali', 'Focacce e rustici'],
      popular: true,
    },
    {
      id: 'pkg-gourmet',
      title: 'Buffet Gourmet & Sfizi Pregiati',
      description: 'Pizze con impasti speciali, salumi tipici DOP, formaggi selezionati e finger food.',
      pricePerPerson: 19,
      highlights: ['Impasti multicereali & kamut', 'Salumi e formaggi del territorio', 'Dessert pizza con Nutella e pistacchio'],
    },
    {
      id: 'pkg-party',
      title: 'Party & Aperitivo Maxi',
      description: 'Perfetto per feste giovani, lauree e compleanni con abbondanti tranci e rustici.',
      pricePerPerson: 12,
      highlights: ['Pizze margherita & speciali', 'Rustici caldi & calzoni', 'Bibite incluse su richiesta'],
    },
  ]);

  getStatusBadge(status: ICustomerQuoteRequest['status']): { label: string; class: string } {
    switch (status) {
      case 'confirmed':
        return { label: 'Confermato', class: 'badge-success' };
      case 'under_review':
        return { label: 'In elaborazione', class: 'badge-warning' };
      case 'draft':
        return { label: 'Bozza', class: 'badge-ghost' };
    }
  }

  logout(): void {
    this.#authService.logout();
  }
}
