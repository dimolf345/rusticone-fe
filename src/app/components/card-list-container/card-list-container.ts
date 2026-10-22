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
  TemplateRef,
  viewChild,
} from '@angular/core';
import { CardGroupBy, ICardAction, ICardConfig, ICardGroup, ICardPayload } from '@core';
import { GenericCard } from '../generic-card/generic-card';
import { CardListGrid } from './card-list-grid/card-list-grid';
import { CardListGrouped } from './card-list-grouped/card-list-grouped';

export type CardResourceRef<T = unknown> = HttpResourceRef<T> | ResourceRef<T>;

@Component({
  selector: 'app-card-list-container',
  imports: [CardListGrid, CardListGrouped],
  templateUrl: './card-list-container.html',
  styleUrl: './card-list-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListContainer {
  // Inputs
  readonly httpResource = input<CardResourceRef<unknown> | null | undefined>(undefined);
  readonly httpResourceMappingFn = input<((value: unknown) => ICardPayload[]) | null>(null);
  readonly items = input<ICardPayload[] | null | undefined>(undefined);
  readonly cardConfig = input<ICardConfig | null | undefined>(undefined);
  readonly actions = input<ICardAction[]>([]);
  readonly searchTerm = input<string>('');
  readonly groupBy = input<CardGroupBy | null | undefined>(undefined);
  readonly groupOrder = input<string[] | null | undefined>(undefined);
  readonly initialCollapsed = input<boolean>(false);
  readonly emptyTitle = input<string>('Nessun elemento');
  readonly emptySubtitle = input<string>('Non ci sono schede da visualizzare.');
  readonly loadingMessage = input<string>('Caricamento in corso...');

  // Outputs
  readonly cardAction = output<ICardAction>();
  readonly cardActions = output<ICardAction>();

  // Subcomponent child view reference
  readonly groupedComponent = viewChild(CardListGrouped);

  // Content children
  readonly contentCards = contentChildren(GenericCard, { descendants: true });
  readonly cardTemplate =
    contentChild<TemplateRef<{ $implicit: unknown; item: unknown }>>('cardTemplate');

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

  readonly resolvedItems = computed<ICardPayload[]>(() => {
    const directItems = this.items();
    if (Array.isArray(directItems)) {
      return directItems;
    }

    const res = this.httpResource();
    if (!res || res.error?.()) {
      return [];
    }

    const val = res.value?.();
    const mappingFn = this.httpResourceMappingFn();
    if (mappingFn) {
      if (val === undefined || val === null) {
        return [];
      }
      return mappingFn(val) ?? [];
    }

    return Array.isArray(val) ? (val as ICardPayload[]) : [];
  });

  readonly filteredItems = computed<ICardPayload[]>(() => {
    const items = this.resolvedItems();
    const query = this.searchTerm()?.toLowerCase().trim();
    if (!query) return items;

    return items.filter((item) => {
      const title = String(item.title ?? '').toLowerCase();
      const desc = String(item.description ?? '').toLowerCase();
      const categories = Array.isArray(item.categories)
        ? item.categories.join(' ').toLowerCase()
        : '';
      return title.includes(query) || desc.includes(query) || categories.includes(query);
    });
  });

  readonly hasResolvedItems = computed(() => this.filteredItems().length > 0);

  readonly isGrouped = computed(() => !!this.groupBy());

  readonly isEmpty = computed(() => {
    if (this.isLoading() || this.error()) return false;
    if (this.httpResource() !== undefined || this.items() !== undefined) {
      return this.filteredItems().length === 0;
    }
    return false;
  });

  // Grouped items from httpResource or items array
  readonly groupedItems = computed<ICardGroup<ICardPayload>[]>(() => {
    const groupBy = this.groupBy();
    const items = this.filteredItems();
    if (!groupBy || items.length === 0) return [];

    const map = new Map<string, ICardPayload[]>();

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
    return this.groupedComponent()?.isGroupOpen(groupKey) ?? !this.initialCollapsed();
  }

  onCardAction(action: ICardAction): void {
    this.cardAction.emit(action);
    this.cardActions.emit(action);
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
