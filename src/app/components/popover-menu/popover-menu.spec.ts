import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getByTestId, ICardAction } from '@core';
import { provideIcons } from '@ng-icons/core';
import { heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverMenu } from './popover-menu';

describe('PopoverMenu', () => {
  let component: PopoverMenu;
  let fixture: ComponentFixture<PopoverMenu>;
  let template: DebugElement;
  let _componentRef: ComponentRef<PopoverMenu>;

  const testIdPrefix = 'Popover Menu - ';

  const mockActions: ICardAction[] = [
    { actionName: 'Modifica', icon: 'heroPencil' },
    { actionName: 'Elimina', icon: 'heroTrash', theme: 'text-error' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverMenu],
      providers: [provideIcons({ heroPencil, heroTrash })],
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverMenu);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the popover menu component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the menu button with default aria-label and popover target', () => {
      const menuBtn = getByTestId(template, 'Menu button', { prefix: testIdPrefix });

      expect(menuBtn).toBeTruthy();
      expect(menuBtn?.nativeElement.getAttribute('aria-label')).toBe('Azioni');
      expect(menuBtn?.nativeElement.getAttribute('popovertarget')).toContain('popover-menu-');
    });

    it('should display custom aria-label when ariaLabel input is provided', () => {
      fixture.componentRef.setInput('ariaLabel', 'Menu per pizza');
      fixture.detectChanges();

      const menuBtn = getByTestId(template, 'Menu button', { prefix: testIdPrefix });
      expect(menuBtn?.nativeElement.getAttribute('aria-label')).toBe('Menu per pizza');
    });

    it('should render all action items in the popover list', () => {
      fixture.componentRef.setInput('actions', mockActions);
      fixture.detectChanges();

      const item1 = getByTestId(template, 'Item Modifica', { prefix: testIdPrefix });
      const item2 = getByTestId(template, 'Item Elimina', { prefix: testIdPrefix });

      expect(item1).toBeTruthy();
      expect(item1?.nativeElement.textContent).toContain('Modifica');
      expect(item2).toBeTruthy();
      expect(item2?.nativeElement.textContent).toContain('Elimina');
    });

    it('should disable the menu button when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const menuBtn = getByTestId(template, 'Menu button', { prefix: testIdPrefix });
      expect(menuBtn?.nativeElement.disabled).toBe(true);
    });
  });

  describe('Behavior', () => {
    it('should emit action event when an action item is clicked', () => {
      fixture.componentRef.setInput('actions', mockActions);
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.action.subscribe(emitSpy);

      const item1 = getByTestId(template, 'Item Modifica', { prefix: testIdPrefix });
      item1?.nativeElement.click();

      expect(emitSpy).toHaveBeenCalledWith(mockActions[0]);
    });

    it('should stop propagation when the menu button is clicked', () => {
      const menuBtn = getByTestId(template, 'Menu button', { prefix: testIdPrefix });
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopSpy = vi.spyOn(clickEvent, 'stopPropagation');

      menuBtn?.nativeElement.dispatchEvent(clickEvent);

      expect(stopSpy).toHaveBeenCalled();
    });

    it('should position the popover element when toggle event opens', () => {
      const buttonEl = document.createElement('button');
      vi.spyOn(buttonEl, 'getBoundingClientRect').mockReturnValue({
        bottom: 100,
        top: 80,
        right: 200,
        left: 170,
        width: 30,
        height: 20,
        x: 170,
        y: 80,
        toJSON: () => {},
      });

      const popoverEl = document.createElement('div');
      Object.defineProperty(popoverEl, 'offsetWidth', { value: 150 });
      Object.defineProperty(popoverEl, 'offsetHeight', { value: 80 });

      const fakeToggleEvent = { newState: 'open' } as ToggleEvent;
      component.onPopoverToggle(fakeToggleEvent, buttonEl, popoverEl);

      expect(popoverEl.style.position).toBe('fixed');
      expect(popoverEl.style.top).toBe('106px');
      expect(popoverEl.style.left).toBe('50px');
      expect(popoverEl.style.zIndex).toBe('100');
    });
  });
});
