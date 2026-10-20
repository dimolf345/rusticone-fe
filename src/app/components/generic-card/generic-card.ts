import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  TemplateRef,
  viewChild
} from '@angular/core';
import { CardLayout, CardRound, CardSize, ICardAction, ICardPayload } from '@core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-generic-card',
  imports: [NgTemplateOutlet, NgIcon],
  templateUrl: './generic-card.html',
  styleUrl: './generic-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
  ],
})
export class GenericCard {
  // Inputs
  readonly payload = input<ICardPayload | null>(null);
  readonly size = model<CardSize>('regular');
  readonly layout = model<CardLayout>('vertical');
  readonly testId = input('Generic Card');
  readonly round = model<CardRound>('regular');
  readonly actionAlwaysVisible = input(false, { transform: booleanAttribute });
  readonly actions = input<ICardAction[]>([]);
  readonly showImgeDetail = input(false, { transform: booleanAttribute });
  readonly footerClass = input<string>('');

  // Outputs
  readonly action = output<ICardAction>();
  readonly cardClick = output<void>();

  //Computed 
  readonly composedTestId = computed(() => `${this.testId()} - `);
  readonly cardContainerClasses = computed(() => {
    const cardSizeClass = `card-${this.size()}`;
    const cardLayoutClass = `card-${this.layout()}`;
    const cardRoundClass = `card-round-${this.round()}`;
    const noImageClass = !this.payload()?.imageUrl ? 'card-no-image' : '';
    return [cardSizeClass, cardLayoutClass, cardRoundClass, noImageClass].filter(Boolean);
  });

  readonly showInputBindingTemplate = computed(() => this.payload() !== null);

  // #region CONTENT-CHILDREN

  // #endregion

  readonly showActions = computed(() => {
    const alwaysVisible = this.actionAlwaysVisible();
    const size = this.size();
    return alwaysVisible ? true : size !== 'small';
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

  onCardClick(): void {

  }


}
