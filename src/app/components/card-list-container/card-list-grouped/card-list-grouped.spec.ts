import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getByTestId, ICardAction, ICardGroup } from '@core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenericCard } from '../../generic-card/generic-card';
import { CardListGrouped } from './card-list-grouped';

describe('CardListGrouped', () => {
  let component: CardListGrouped;
  let fixture: ComponentFixture<CardListGrouped>;
  let template: DebugElement;
  let _componentRef: ComponentRef<CardListGrouped>;

  const testIdPrefix = 'Card List Container - ';

  const mockGroups: ICardGroup<unknown>[] = [
    {
      key: 'Pizza',
      title: 'Pizza',
      items: [
        { id: 'p1', name: 'Margherita', basePrice: 8.5 },
        { id: 'p2', name: 'Diavola', basePrice: 9.5 },
      ],
      isOpen: true,
    },
    {
      key: 'Dolci',
      title: 'Dolci',
      items: [{ id: 'd1', name: 'Tiramisù', basePrice: 5.0 }],
      isOpen: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListGrouped],
    }).compileComponents();

    fixture = TestBed.createComponent(CardListGrouped);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the card-list-grouped component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the grouped container', () => {
      const container = getByTestId(template, 'Grouped container', { prefix: testIdPrefix });
      expect(container).toBeTruthy();
    });

    it('should display groups and items when hasResolvedItems is true', () => {
      fixture.componentRef.setInput('hasResolvedItems', true);
      fixture.componentRef.setInput('groups', mockGroups);
      fixture.detectChanges();

      const groupPizza = getByTestId(template, 'Group Pizza', { prefix: testIdPrefix });
      const groupDolci = getByTestId(template, 'Group Dolci', { prefix: testIdPrefix });
      expect(groupPizza).toBeTruthy();
      expect(groupDolci).toBeTruthy();

      const pizzaCount = getByTestId(template, 'Group count Pizza', { prefix: testIdPrefix });
      expect(pizzaCount?.nativeElement.textContent.trim()).toBe('2');

      const dolciCount = getByTestId(template, 'Group count Dolci', { prefix: testIdPrefix });
      expect(dolciCount?.nativeElement.textContent.trim()).toBe('1');

      const cards = template.queryAll(By.directive(GenericCard));
      expect(cards.length).toBe(3);
    });
  });

  describe('Behavior', () => {
    it('should toggle group open state on details toggle', () => {
      fixture.componentRef.setInput('hasResolvedItems', true);
      fixture.componentRef.setInput('groups', mockGroups);
      fixture.detectChanges();

      expect(component.isGroupOpen('Pizza')).toBe(true);

      const detailsEl = getByTestId(template, 'Group Pizza', {
        prefix: testIdPrefix,
      })?.nativeElement as HTMLDetailsElement;

      detailsEl.open = false;
      detailsEl.dispatchEvent(new Event('toggle'));
      fixture.detectChanges();

      expect(component.isGroupOpen('Pizza')).toBe(false);
    });

    it('should emit cardAction when child GenericCard emits action', () => {
      fixture.componentRef.setInput('hasResolvedItems', true);
      fixture.componentRef.setInput('groups', mockGroups);
      fixture.detectChanges();

      const actionSpy = vi.fn();
      component.cardAction.subscribe(actionSpy);

      const card = template.query(By.directive(GenericCard)).componentInstance as GenericCard;
      const testAction: ICardAction = { actionName: 'select', item: mockGroups[0].items[0] };
      card.action.emit(testAction);

      expect(actionSpy).toHaveBeenCalledWith(testAction);
    });
  });
});
