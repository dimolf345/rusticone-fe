import { NgTemplateOutlet } from '@angular/common';
import { type HttpResourceRef } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  input,
  output,
  type ResourceRef,
  signal,
  TemplateRef,
} from '@angular/core';
import { CardGroupBy, ICardAction, ICardGroup } from '@core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroChevronUp } from '@ng-icons/heroicons/outline';
import { GenericCard } from '../generic-card/generic-card';

export type CardResourceRef<T = unknown> = HttpResourceRef<T> | ResourceRef<T>;

@Component({
  selector: 'app-card-list-container',
  imports: [NgTemplateOutlet, GenericCard, NgIcon],
  templateUrl: './card-list-container.html',
  styleUrl: './card-list-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronUp,
    }),
  ],
})
export class CardListContainer {
  // Inputs
  readonly httpResource = input<CardResourceRef<unknown> | null | undefined>(undefined);
  readonly items = input<unknown[] | null | undefined>(undefined);
  readonly groupBy = input<CardGroupBy | null | undefined>(undefined);
  readonly groupOrder = input<string[] | null | undefined>(undefined);
  readonly initialCollapsed = input<boolean>(false);
  readonly emptyTitle = input<string>('Nessun elemento');
  readonly emptySubtitle = input<string>('Non ci sono schede da visualizzare.');
  readonly loadingMessage = input<string>('Caricamento in corso...');

  // Outputs
  readonly cardAction = output<ICardAction>();
  readonly cardActions = output<ICardAction>();

  // Content children
  readonly contentCards = contentChildren(GenericCard, { descendants: true });
  readonly cardTemplate =
    contentChild<TemplateRef<{ $implicit: unknown; item: unknown; }>>('cardTemplate');

  // Group open/collapse manual overrides
  readonly #groupOpenState = signal<Record<string, boolean>>({});

  // Computed state
  readonly hasHttpResource = computed(() => !!this.httpResource());

  readonly isLoading = computed(() => {
    const res = this.httpResource();
    return !!res?.isLoading?.();
  });

  readonly error = computed(() => {
    const res = this.httpResource();
    return res?.error?.();
  });

  readonly resolvedItems = computed<any[]>(() => {
    const res = this.httpResource();
    if (res) {
      const val = res.value?.();
      if (Array.isArray(val)) return val;
      if (val && typeof val === 'object') {
        const record = val as Record<string, unknown>;
        for (const key of ['data', 'products', 'items', 'results']) {
          if (Array.isArray(record[key])) {
            return record[key];
          }
        }
        return [val];
      }
      return [];
    }

    const directItems = this.items();
    if (Array.isArray(directItems)) return directItems;
    return [];
  });

  readonly hasResolvedItems = computed(() => this.resolvedItems().length > 0);

  readonly isGrouped = computed(() => !!this.groupBy());

  readonly isEmpty = computed(() => {
    if (this.isLoading() || this.error()) return false;
    if (this.httpResource() !== undefined || this.items() !== undefined) {
      return this.resolvedItems().length === 0;
    }
    return false;
  });

  // Grouped items from httpResource or items array
  readonly groupedItems = computed<ICardGroup<unknown>[]>(() => {
    const groupBy = this.groupBy();
    const items = this.resolvedItems();
    if (!groupBy || items.length === 0) return [];

    const map = new Map<string, unknown[]>();

    for (const item of items) {
      const keys = this.#extractKeys(item, groupBy);
      for (const key of keys) {
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(item);
      }
    }

    return this.#sortAndFormatGroups(map);
  });

  // Grouped content children cards
  readonly groupedContentCards = computed<ICardGroup<GenericCard>[]>(() => {
    const groupBy = this.groupBy();
    const cards = this.contentCards();
    if (!groupBy || cards.length === 0) return [];

    const map = new Map<string, GenericCard[]>();

    for (const card of cards) {
      const keys = this.#extractCardKeys(card, groupBy);
      for (const key of keys) {
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(card);
      }
    }

    return this.#sortAndFormatGroups(map);
  });

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
    this.cardActions.emit(action);
  }

  itemTrackBy(item: unknown, index: number): string | number {
    const it = item as Record<string, unknown> | null | undefined;
    return (it?.['id'] as string | number) ?? (it?.['_id'] as string | number) ?? (it?.['name'] as string) ?? index;
  }

  // #region PRIVATE HELPERS
  #extractKeys(item: unknown, groupBy: CardGroupBy): string[] {
    if (typeof groupBy === 'function') {
      const res = groupBy(item);
      if (Array.isArray(res)) return res.length > 0 ? res.map(String) : ['Altro'];
      return res ? [String(res)] : ['Altro'];
    }

    if (typeof groupBy === 'string') {
      const it = item as Record<string, unknown> | null | undefined;
      const val = it?.[groupBy];
      if (Array.isArray(val)) return val.length > 0 ? val.map(String) : ['Altro'];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return [String(val)];
      }
    }

    return ['Altro'];
  }

  #extractCardKeys(card: GenericCard, groupBy: CardGroupBy): string[] {
    const cardGroup = [] as string[];
    if (cardGroup !== undefined && cardGroup !== null) {
      if (Array.isArray(cardGroup)) {
        return cardGroup.length > 0 ? cardGroup.map(String) : ['Altro'];
      }
      if (String(cardGroup).trim() !== '') {
        return [String(cardGroup)];
      }
    }

    const cardItem = card.payload();
    if (cardItem) {
      return this.#extractKeys(cardItem, groupBy);
    }

    return ['Altro'];
  }

  #sortAndFormatGroups<T>(map: Map<string, T[]>): ICardGroup<T>[] {
    const order = this.groupOrder();
    const entries = Array.from(map.entries());

    if (order && order.length > 0) {
      entries.sort(([a], [b]) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
    }

    return entries.map(([key, items]) => ({
      key,
      title: key,
      items,
      isOpen: this.isGroupOpen(key),
    }));
  }
  // #endregion
}
