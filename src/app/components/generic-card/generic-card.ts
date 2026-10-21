import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  TemplateRef,
  viewChild
} from '@angular/core';
import { CardLayout, CardRound, CardSize, ICardAction, ICardPayload, LayoutService } from '@core';
import { NgIcon } from '@ng-icons/core';
import { PopoverMenu } from '../popover-menu/popover-menu';

@Component({
  selector: 'app-generic-card',
  imports: [NgTemplateOutlet, NgIcon, PopoverMenu],
  templateUrl: './generic-card.html',
  styleUrl: './generic-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericCard {
  #layoutService = inject(LayoutService, { optional: true });

  // Inputs
  readonly payload = input<ICardPayload | null>(null);
  readonly size = model<CardSize>('regular');
  readonly layout = model<CardLayout>('vertical');
  readonly testId = input('Generic Card');
  readonly round = model<CardRound>('regular');
  readonly actionAlwaysVisible = input(false, { transform: booleanAttribute });
  readonly actions = input<ICardAction[]>([]);
  readonly actionsDisplay = input<'auto' | 'buttons' | 'menu'>('auto');
  readonly showImgeDetail = input(false, { transform: booleanAttribute });
  readonly footerClass = input<string>('');

  // Outputs
  readonly action = output<ICardAction>();
  readonly cardClick = output<void>();

  // Computed 
  readonly composedTestId = computed(() => `${this.testId()} - `);
  readonly cardContainerClasses = computed(() => {
    const cardSizeClass = `card-${this.size()}`;
    const cardLayoutClass = `card-${this.layout()}`;
    const cardRoundClass = `card-round-${this.round()}`;
    const noImageClass = !this.payload()?.imageUrl ? 'card-no-image' : '';
    return [cardSizeClass, cardLayoutClass, cardRoundClass, noImageClass].filter(Boolean);
  });

  readonly showInputBindingTemplate = computed(() => this.payload() !== null);

  readonly isMenuActions = computed(() => {
    const mode = this.actionsDisplay();
    if (mode === 'menu') return true;
    if (mode === 'buttons') return false;
    return this.size() === 'small' || (this.#layoutService?.isMobile() ?? false);
  });

  readonly showActions = computed(() => {
    return this.actions().length > 0;
  });

  // Template ViewChild for group projection
  readonly cardTemplate = viewChild<TemplateRef<unknown>>('cardTemplate');

  onAction(actionType: string, event?: Event): void {
    event?.stopPropagation();
    this.action.emit({
      actionName: actionType,
      item: this.payload(),
    });
  }

  onPopoverAction(act: ICardAction): void {
    this.action.emit({
      ...act,
      item: act.item ?? this.payload(),
    });
  }

  onCardClick(): void {
    this.cardClick.emit();
  }
}
