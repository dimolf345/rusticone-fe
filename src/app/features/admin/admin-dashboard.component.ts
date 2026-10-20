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
import { CardLayout, CardRound, CardSize, ICardAction, ICardPayload } from '@core';
import { AuthService } from '../../core/services/auth.service';
import { GenericCard } from '../../components/generic-card/generic-card';
import { CARD_SELECTORS } from '../../components/generic-card/selectors';

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
  imports: [NgIcon, GenericCard, ...CARD_SELECTORS],
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

  // #region DEV - CARD PLAYGROUND (remove when done)
  readonly cardSizes: CardSize[] = ['small', 'regular', 'large'];
  readonly cardLayouts: CardLayout[] = ['vertical', 'horizontal'];
  readonly cardRounds: CardRound[] = ['none', 'regular', 'full'];

  readonly mockCards: ICardPayload[] = [
    {
      title: 'Pizza Margherita',
      description: 'Impasto a lunga lievitazione, pomodoro San Marzano, fiordilatte e basilico fresco.',
      imageUrl: 'images/mock/pizza-margherita.jpg',
      imageAlt: 'Pizza margherita su tagliere in legno',
      titleBadges: [{ badgeVariant: 'badge-primary', badgeContent: 'Classica' }],
      descriptionBadges: [
        { badgeVariant: 'badge-ghost', badgeContent: 'Vegetariana' },
        { badgeVariant: 'badge-ghost', badgeContent: 'Pizze' },
      ],
      footer: '€ 8,50',
    },
    {
      title: 'Rustici & Arancini',
      description: 'Vassoio misto di rustici sfogliati e arancini al ragù, ideale per buffet e aperitivi.',
      imageUrl: 'images/mock/rustici-buffet.jpg',
      imageAlt: 'Vassoio di rustici e arancini',
      titleBadges: [{ badgeVariant: 'badge-secondary', badgeContent: 'Buffet' }],
      descriptionBadges: [{ badgeVariant: 'badge-ghost', badgeContent: 'Fritti' }],
      footer: '€ 24,00 / vassoio',
    },
    {
      title: 'Pizza al Taglio Mortadella & Burrata',
      description: 'Teglia romana con mortadella IGP, burrata pugliese e granella di pistacchio.',
      imageUrl: 'images/mock/pizza-taglio.jpg',
      imageAlt: 'Teglia di pizza al taglio con mortadella e burrata',
      titleBadges: [{ badgeVariant: 'badge-accent', badgeContent: 'Novità' }],
      descriptionBadges: [{ badgeVariant: 'badge-ghost', badgeContent: 'Teglie' }],
      footer: '€ 32,00 / teglia',
    },
  ];

  readonly mockCardNoImage: ICardPayload = {
    title: 'Supplemento Bevande',
    description: 'Acqua, bibite e vino della casa per l’intera durata del buffet.',
    imageUrl: '',
    imageAlt: '',
    footer: '€ 4,00 / persona',
  };

  onCardAction(action: ICardAction): void {
    console.log('[Card playground] action', action);
  }
  // #endregion

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
