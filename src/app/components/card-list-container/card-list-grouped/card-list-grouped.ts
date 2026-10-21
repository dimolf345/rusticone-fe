import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { ICardAction, ICardGroup, ICardPayload } from '@core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroChevronUp } from '@ng-icons/heroicons/outline';
import { GenericCard } from '../../generic-card/generic-card';
import { itemTrackBy } from '../card-list.util';

@Component({
  selector: 'app-card-list-grouped',
  imports: [NgTemplateOutlet, GenericCard, NgIcon],
  templateUrl: './card-list-grouped.html',
  styleUrl: './card-list-grouped.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronUp,
    }),
  ],
})
export class CardListGrouped {
  readonly groups = input<ICardGroup<unknown>[]>([]);
  readonly contentGroups = input<ICardGroup<GenericCard>[]>([]);
  readonly hasResolvedItems = input<boolean>(false);
  readonly actions = input<ICardAction[]>([]);
  readonly initialCollapsed = input<boolean>(false);
  readonly cardTemplate =
    input<TemplateRef<{ $implicit: unknown; item: unknown }> | null | undefined>(null);

  readonly cardAction = output<ICardAction>();

  readonly #groupOpenState = signal<Record<string, boolean>>({});

  readonly trackBy = itemTrackBy;

  isGroupOpen(groupKey: string): boolean {
    const state = this.#groupOpenState();
    if (state[groupKey] !== undefined) {
      return state[groupKey];
    }
    return !this.initialCollapsed();
  }

  onGroupToggle(groupKey: string, event: Event): void {
    const details = event.target as HTMLDetailsElement;
    if (details) {
      this.#groupOpenState.update((prev) => ({
        ...prev,
        [groupKey]: details.open,
      }));
    }
  }

  onCardAction(action: ICardAction): void {
    this.cardAction.emit(action);
  }

  asPayload(item: unknown): ICardPayload {
    return item as ICardPayload;
  }
}
