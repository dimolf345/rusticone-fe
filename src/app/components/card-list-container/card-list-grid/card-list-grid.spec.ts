import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getByTestId, ICardAction, ICardPayload } from '@core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenericCard } from '../../generic-card/generic-card';
import { CardListGrid } from './card-list-grid';

describe('CardListGrid', () => {
  let component: CardListGrid;
  let fixture: ComponentFixture<CardListGrid>;
  let template: DebugElement;
  let _componentRef: ComponentRef<CardListGrid>;

  const testIdPrefix = 'Card List Container - ';

  const mockItems: ICardPayload[] = [
    { title: 'Pizza Margherita', description: 'Pomodoro e mozzarella', imageUrl: '', imageAlt: '', footer: '8.50 €' },
    { title: 'Pizza Diavola', description: 'Salame piccante', imageUrl: '', imageAlt: '', footer: '9.50 €' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(CardListGrid);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the card-list-grid component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display grid container', () => {
      const grid = getByTestId(template, 'Grid', { prefix: testIdPrefix });
      expect(grid).toBeTruthy();
    });

    it('should render generic cards when items are provided and hasResolvedItems is true', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('hasResolvedItems', true);
      fixture.detectChanges();

      const cards = template.queryAll(By.directive(GenericCard));
      expect(cards.length).toBe(2);
    });
  });

  describe('Behavior', () => {
    it('should emit cardAction when child card triggers action', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('hasResolvedItems', true);
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.cardAction.subscribe(emitSpy);

      const firstCardInstance = template.query(By.directive(GenericCard)).componentInstance as GenericCard;
      const actionPayload: ICardAction = { actionName: 'edit', item: mockItems[0] };
      firstCardInstance.action.emit(actionPayload);

      expect(emitSpy).toHaveBeenCalledWith(actionPayload);
    });
  });
});
