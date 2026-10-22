import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { ICardAction, ICardConfig, ICardPayload } from '@core';
import { GenericCard } from '../../generic-card/generic-card';
import { itemTrackBy } from '../card-list.util';

@Component({
  selector: 'app-card-list-grid',
  imports: [NgTemplateOutlet, GenericCard],
  templateUrl: './card-list-grid.html',
  styleUrl: './card-list-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListGrid {
  readonly items = input<ICardPayload[]>([]);
  readonly hasResolvedItems = input<boolean>(false);
  readonly actions = input<ICardAction[]>([]);
  readonly cardConfig = input<ICardConfig | null | undefined>(undefined);
  readonly cardTemplate =
    input<TemplateRef<{ $implicit: unknown; item: unknown }> | null | undefined>(null);

  readonly cardAction = output<ICardAction>();

  readonly trackBy = itemTrackBy;

  onCardAction(action: ICardAction): void {
    this.cardAction.emit(action);
  }

  asPayload(item: ICardPayload): ICardPayload {
    return item;
  }
}
