import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getByTestId, ICardAction, ICardPayload } from '@core';
import { provideIcons } from '@ng-icons/core';
import { heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverMenu } from '../popover-menu/popover-menu';
import { GenericCard } from './generic-card';

describe('GenericCard', () => {
  let component: GenericCard;
  let fixture: ComponentFixture<GenericCard>;
  let template: DebugElement;
  let _componentRef: ComponentRef<GenericCard>;

  const testIdPrefix = 'Generic Card - ';

  const mockPayload: ICardPayload = {
    title: 'Pizza Margherita',
    description: 'Pomodoro, mozzarella di bufala e basilico fresco',
    imageUrl: 'https://example.com/pizza.jpg',
    imageAlt: 'Foto Pizza Margherita',
    footer: '8.50 €',
    titleBadges: [{ badgeVariant: 'badge-primary', badgeContent: 'Classica' }],
    descriptionBadges: [{ badgeVariant: 'badge-secondary', badgeContent: 'Vegetariana' }],
  };

  const mockActions: ICardAction[] = [
    { actionName: 'Modifica', icon: 'heroPencil' },
    { actionName: 'Elimina', icon: 'heroTrash', theme: 'text-error' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericCard],
      providers: [provideIcons({ heroPencil, heroTrash })],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericCard);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the generic card component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display card container', () => {
      const card = template.query(By.css('.card-base'));
      expect(card).toBeTruthy();
    });

    it('should display payload details correctly when payload is provided', () => {
      fixture.componentRef.setInput('payload', mockPayload);
      fixture.detectChanges();

      const image = getByTestId(template, 'Image', { prefix: testIdPrefix });
      const footer = getByTestId(template, 'Footer', { prefix: testIdPrefix });
      const title = template.query(By.css('.card-title'));
      const description = template.query(By.css('.card-description'));

      expect(title?.nativeElement.textContent.trim()).toBe('Pizza Margherita');
      expect(description?.nativeElement.textContent.trim()).toBe(
        'Pomodoro, mozzarella di bufala e basilico fresco',
      );
      expect(footer?.nativeElement.textContent.trim()).toBe('8.50 €');
      expect(image?.nativeElement.getAttribute('src')).toBe('https://example.com/pizza.jpg');
    });

    it('should render standard bottom actions for regular cards with buttons display', () => {
      fixture.componentRef.setInput('payload', mockPayload);
      fixture.componentRef.setInput('actions', mockActions);
      fixture.componentRef.setInput('actionsDisplay', 'buttons');
      fixture.detectChanges();

      const actionsEl = getByTestId(template, 'Actions', { prefix: testIdPrefix });
      expect(actionsEl).toBeTruthy();

      const popoverEl = template.query(By.directive(PopoverMenu));
      expect(popoverEl).toBeFalsy();
    });

    it('should render popover-menu for small cards or when actionsDisplay is menu', () => {
      fixture.componentRef.setInput('payload', mockPayload);
      fixture.componentRef.setInput('actions', mockActions);
      fixture.componentRef.setInput('size', 'small');
      fixture.detectChanges();

      const popoverEl = template.query(By.directive(PopoverMenu));
      expect(popoverEl).toBeTruthy();
    });
  });

  describe('Behavior', () => {
    it('should emit cardClick when card is clicked', () => {
      const clickSpy = vi.fn();
      component.cardClick.subscribe(clickSpy);

      const card = template.query(By.css('.card-base'));
      card?.nativeElement.click();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should emit action when a button action is clicked', () => {
      fixture.componentRef.setInput('payload', mockPayload);
      fixture.componentRef.setInput('actions', mockActions);
      fixture.componentRef.setInput('actionsDisplay', 'buttons');
      fixture.detectChanges();

      const actionSpy = vi.fn();
      component.action.subscribe(actionSpy);

      const firstBtn = template.query(By.css('.card-actions button'));
      firstBtn?.nativeElement.click();

      expect(actionSpy).toHaveBeenCalledWith({
        actionName: 'Modifica',
        item: mockPayload,
      });
    });

    it('should emit action when popover menu emits an action', () => {
      fixture.componentRef.setInput('payload', mockPayload);
      fixture.componentRef.setInput('actions', mockActions);
      fixture.componentRef.setInput('actionsDisplay', 'menu');
      fixture.detectChanges();

      const actionSpy = vi.fn();
      component.action.subscribe(actionSpy);

      const popoverDebugEl = template.query(By.directive(PopoverMenu));
      const popoverInstance = popoverDebugEl.componentInstance as PopoverMenu;

      popoverInstance.action.emit(mockActions[0]);

      expect(actionSpy).toHaveBeenCalledWith({
        actionName: 'Modifica',
        icon: 'heroPencil',
        item: mockPayload,
      });
    });
  });
});
