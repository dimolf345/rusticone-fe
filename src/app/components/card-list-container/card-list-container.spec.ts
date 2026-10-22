import { Component, ComponentRef, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getByTestId, ICardAction, ICardPayload } from '@core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenericCard } from '../generic-card/generic-card';
import { CardListContainer, CardResourceRef } from './card-list-container';

@Component({
  imports: [CardListContainer, GenericCard],
  template: `
    <app-card-list-container [groupBy]="groupBy" [initialCollapsed]="initialCollapsed">
      <app-generic-card [payload]="pizza1" />
      <app-generic-card [payload]="pizza2" />
      <app-generic-card [payload]="dolce1" />
    </app-card-list-container>
  `,
})
class TestHostProjectedComponent {
  groupBy: string | null = 'category';
  initialCollapsed = false;
  pizza1 = {
    title: 'Margherita',
    description: '',
    imageUrl: '',
    imageAlt: '',
    footer: '8.5',
    category: 'Pizza',
  };
  pizza2 = {
    title: 'Diavola',
    description: '',
    imageUrl: '',
    imageAlt: '',
    footer: '9.5',
    category: 'Pizza',
  };
  dolce1 = {
    title: 'Tiramisù',
    description: '',
    imageUrl: '',
    imageAlt: '',
    footer: '5.0',
    category: 'Dolci',
  };
}

describe('CardListContainer', () => {
  let component: CardListContainer;
  let fixture: ComponentFixture<CardListContainer>;
  let template: DebugElement;
  let _componentRef: ComponentRef<CardListContainer>;

  const testIdPrefix = 'Card List Container - ';

  const mockProducts: ICardPayload[] = [
    {
      id: 'p1',
      title: 'Pizza Margherita',
      description: 'Pomodoro e mozzarella',
      imageUrl: '',
      imageAlt: 'Pizza Margherita',
      footer: '8.5',
      categories: ['Pizza', 'Cotti al forno'],
    },
    {
      id: 'p2',
      title: 'Rustico Leccese',
      description: 'Besciamella e pomodoro',
      imageUrl: '',
      imageAlt: 'Rustico Leccese',
      footer: '3.5',
      categories: ['Rustici', 'Cotti al forno'],
    },
    {
      id: 'p3',
      title: 'Pasticciotto Crema',
      description: 'Crema pasticcera',
      imageUrl: '',
      imageAlt: 'Pasticciotto Crema',
      footer: '2.5',
      categories: ['Dolci'],
    },
  ];

  const createMockResource = <T>(options: {
    value?: T;
    isLoading?: boolean;
    error?: unknown;
  }): CardResourceRef<T> => {
    const valSig = signal(options.value);
    const loadingSig = signal(options.isLoading ?? false);
    const errorSig = signal(options.error ?? undefined);

    return {
      value: valSig.asReadonly(),
      hasValue: () => valSig() !== undefined,
      isLoading: loadingSig.asReadonly(),
      status: () => (loadingSig() ? 'loading' : 'resolved'),
      error: errorSig.asReadonly(),
      reload: vi.fn(),
      set: (v: T) => valSig.set(v),
      update: (fn: (prev: T | undefined) => T) => valSig.update(fn),
    } as unknown as CardResourceRef<T>;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListContainer, GenericCard, TestHostProjectedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardListContainer);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the card-list-container component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the main container', () => {
      const container = getByTestId(template, 'Main container', { prefix: testIdPrefix });
      expect(container).toBeTruthy();
    });

    it('should display loading spinner and message when resource is loading', () => {
      const loadingRes = createMockResource({ isLoading: true });
      fixture.componentRef.setInput('httpResource', loadingRes);
      fixture.detectChanges();

      const loadingContainer = getByTestId(template, 'Loading container', {
        prefix: testIdPrefix,
      });
      const loadingMsg = getByTestId(template, 'Loading message', { prefix: testIdPrefix });

      expect(loadingContainer).toBeTruthy();
      expect(loadingMsg?.nativeElement.textContent.trim()).toBe('Caricamento in corso...');
    });

    it('should display error alert when resource has error', () => {
      const errorRes = createMockResource({ error: 'Network Error 500' });
      fixture.componentRef.setInput('httpResource', errorRes);
      fixture.detectChanges();

      const errorContainer = getByTestId(template, 'Error container', {
        prefix: testIdPrefix,
      });
      const errorMsg = getByTestId(template, 'Error message', { prefix: testIdPrefix });

      expect(errorContainer).toBeTruthy();
      expect(errorMsg?.nativeElement.textContent.trim()).toContain(
        'Si è verificato un errore nel caricamento dei dati.',
      );
    });

    it('should display empty state when items is an empty array', () => {
      fixture.componentRef.setInput('items', []);
      fixture.detectChanges();

      const emptyContainer = getByTestId(template, 'Empty container', {
        prefix: testIdPrefix,
      });
      const emptyTitle = getByTestId(template, 'Empty title', { prefix: testIdPrefix });

      expect(emptyContainer).toBeTruthy();
      expect(emptyTitle?.nativeElement.textContent.trim()).toBe('Nessun elemento');
    });

    it('should render generic cards in ungrouped grid when items are provided without groupBy', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.detectChanges();

      const grid = getByTestId(template, 'Grid', { prefix: testIdPrefix });
      expect(grid).toBeTruthy();

      const cardDebugEls = template.queryAll(By.directive(GenericCard));
      expect(cardDebugEls.length).toBe(3);
    });

    it('should render collapsible groups when groupBy is provided', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.componentRef.setInput('groupBy', 'categories');
      fixture.detectChanges();

      const groupedContainer = getByTestId(template, 'Grouped container', {
        prefix: testIdPrefix,
      });
      expect(groupedContainer).toBeTruthy();

      const groupPizza = getByTestId(template, 'Group Pizza', { prefix: testIdPrefix });
      const groupRustici = getByTestId(template, 'Group Rustici', { prefix: testIdPrefix });
      const groupDolci = getByTestId(template, 'Group Dolci', { prefix: testIdPrefix });

      expect(groupPizza).toBeTruthy();
      expect(groupRustici).toBeTruthy();
      expect(groupDolci).toBeTruthy();
    });

    it('should display group count badges corresponding to item counts', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.componentRef.setInput('groupBy', 'categories');
      fixture.detectChanges();

      const pizzaCount = getByTestId(template, 'Group count Pizza', { prefix: testIdPrefix });
      const cottiCount = getByTestId(template, 'Group count Cotti al forno', {
        prefix: testIdPrefix,
      });

      expect(pizzaCount?.nativeElement.textContent.trim()).toBe('1');
      expect(cottiCount?.nativeElement.textContent.trim()).toBe('2'); // Pizza + Rustico
    });
  });

  describe('Behavior', () => {
    it('should automatically render generic-cards when httpResource value is provided', () => {
      const resource = createMockResource({ value: mockProducts });
      fixture.componentRef.setInput('httpResource', resource);
      fixture.detectChanges();

      const cardDebugEls = template.queryAll(By.directive(GenericCard));
      expect(cardDebugEls.length).toBe(3);
    });

    it('should execute httpResourceMappingFn against resource.value when provided', () => {
      const apiResponse = { products: mockProducts };
      const resource = createMockResource({ value: apiResponse });
      const mappingFn = vi.fn((val: unknown) => {
        const payload = val as { products: ICardPayload[] };
        return payload.products.map((p) => ({
          ...p,
          title: `Mapped: ${p.title}`,
        }));
      });

      fixture.componentRef.setInput('httpResource', resource);
      fixture.componentRef.setInput('httpResourceMappingFn', mappingFn);
      fixture.detectChanges();

      expect(mappingFn).toHaveBeenCalledWith(apiResponse);
      const cardDebugEls = template.queryAll(By.directive(GenericCard));
      expect(cardDebugEls.length).toBe(3);
    });

    it('should return empty array if resource value is not an array and no mappingFn is provided', () => {
      const resource = createMockResource({ value: { notAnArray: true } });
      fixture.componentRef.setInput('httpResource', resource);
      fixture.detectChanges();

      const cardDebugEls = template.queryAll(By.directive(GenericCard));
      expect(cardDebugEls.length).toBe(0);
      expect(component.resolvedItems()).toEqual([]);
    });

    it('should forward cardConfig to rendered GenericCard components', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.componentRef.setInput('cardConfig', { layout: 'horizontal', size: 'large' });
      fixture.detectChanges();

      const cardDebugEls = template.queryAll(By.directive(GenericCard));
      expect(cardDebugEls.length).toBe(3);
      const firstCard = cardDebugEls[0].componentInstance as GenericCard;
      expect(firstCard.layout()).toBe('horizontal');
      expect(firstCard.size()).toBe('large');
    });

    it('should emit cardAction when a child GenericCard triggers an action', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.detectChanges();

      const actionSpy = vi.fn();
      component.cardAction.subscribe(actionSpy);

      const firstCardDebugEl = template.query(By.directive(GenericCard));
      const firstCardInstance = firstCardDebugEl.componentInstance as GenericCard;

      const actionPayload: ICardAction = {
        actionName: 'edit',
        item: mockProducts[0],
      };
      firstCardInstance.action.emit(actionPayload);

      expect(actionSpy).toHaveBeenCalledWith(actionPayload);
    });

    it('should support custom groupBy function', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.componentRef.setInput('groupBy', (item: ICardPayload) =>
        parseFloat(item.footer) > 5 ? 'Costosi' : 'Economici',
      );
      fixture.detectChanges();

      const groupCostosi = getByTestId(template, 'Group Costosi', { prefix: testIdPrefix });
      const groupEconomici = getByTestId(template, 'Group Economici', { prefix: testIdPrefix });

      expect(groupCostosi).toBeTruthy();
      expect(groupEconomici).toBeTruthy();

      const costosiCount = getByTestId(template, 'Group count Costosi', {
        prefix: testIdPrefix,
      });
      const economiciCount = getByTestId(template, 'Group count Economici', {
        prefix: testIdPrefix,
      });

      expect(costosiCount?.nativeElement.textContent.trim()).toBe('1'); // Pizza Margherita (8.5)
      expect(economiciCount?.nativeElement.textContent.trim()).toBe('2'); // Rustico (3.5) + Pasticciotto (2.5)
    });

    it('should order groups according to groupOrder input', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.componentRef.setInput('groupBy', 'categories');
      fixture.componentRef.setInput('groupOrder', ['Dolci', 'Rustici', 'Pizza', 'Cotti al forno']);
      fixture.detectChanges();

      const groups = component.groupedItems();
      expect(groups.map((g) => g.key)).toEqual(['Dolci', 'Rustici', 'Pizza', 'Cotti al forno']);
    });

    it('should respect initialCollapsed input for groups open state', () => {
      fixture.componentRef.setInput('items', mockProducts);
      fixture.componentRef.setInput('groupBy', 'categories');
      fixture.componentRef.setInput('initialCollapsed', true);
      fixture.detectChanges();

      expect(component.isGroupOpen('Pizza')).toBe(false);

      fixture.componentRef.setInput('initialCollapsed', false);
      fixture.detectChanges();

      expect(component.isGroupOpen('Pizza')).toBe(true);
    });

    it('should group projected GenericCard content children when groupBy is provided', () => {
      const hostFixture = TestBed.createComponent(TestHostProjectedComponent);
      hostFixture.detectChanges();

      const hostTemplate = hostFixture.debugElement;
      const pizzaGroup = getByTestId(hostTemplate, 'Group Pizza', { prefix: testIdPrefix });
      const dolciGroup = getByTestId(hostTemplate, 'Group Dolci', { prefix: testIdPrefix });

      expect(pizzaGroup).toBeTruthy();
      expect(dolciGroup).toBeTruthy();

      const pizzaCount = getByTestId(hostTemplate, 'Group count Pizza', {
        prefix: testIdPrefix,
      });
      const dolciCount = getByTestId(hostTemplate, 'Group count Dolci', {
        prefix: testIdPrefix,
      });

      expect(pizzaCount?.nativeElement.textContent.trim()).toBe('2');
      expect(dolciCount?.nativeElement.textContent.trim()).toBe('1');
    });
  });
});
