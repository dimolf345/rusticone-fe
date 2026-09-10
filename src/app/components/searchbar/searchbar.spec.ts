import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getByTestId } from '@core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Searchbar } from './searchbar';

describe('Searchbar', () => {
  let component: Searchbar;
  let fixture: ComponentFixture<Searchbar>;
  let template: DebugElement;
  let _componentRef: ComponentRef<Searchbar>;

  const testIdPrefix = 'Searchbar - ';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Searchbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Searchbar);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the searchbar component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the searchbar container', () => {
      const container = getByTestId(template, 'Container', { prefix: testIdPrefix });
      expect(container).toBeTruthy();
    });

    it('should display the search icon wrapper', () => {
      const iconWrapper = getByTestId(template, 'Icon wrapper', { prefix: testIdPrefix });
      expect(iconWrapper).toBeTruthy();
    });

    it('should render the search input element with default placeholder', () => {
      const input = getByTestId(template, 'Input', { prefix: testIdPrefix });
      expect(input).toBeTruthy();
      expect(input?.nativeElement.placeholder).toBe('Cerca...');
      expect(input?.nativeElement.getAttribute('aria-label')).toBe('Cerca...');
    });

    it('should render custom placeholder when provided', () => {
      fixture.componentRef.setInput('placeholder', 'Cerca pizze o rustici...');
      fixture.detectChanges();

      const input = getByTestId(template, 'Input', { prefix: testIdPrefix });
      expect(input?.nativeElement.placeholder).toBe('Cerca pizze o rustici...');
      expect(input?.nativeElement.getAttribute('aria-label')).toBe('Cerca pizze o rustici...');
    });

    it('should not display the clear button when search is empty', () => {
      const clearButton = getByTestId(template, 'Clear button', { prefix: testIdPrefix });
      expect(clearButton).toBeNull();
    });

    it('should display the clear button when search has text', () => {
      component.search.set('Rustico');
      fixture.detectChanges();

      const clearButton = getByTestId(template, 'Clear button', { prefix: testIdPrefix });
      expect(clearButton).toBeTruthy();
    });
  });

  describe('Behavior', () => {
    it('should update search model when typing in the input', async () => {
      const input = getByTestId(template, 'Input', { prefix: testIdPrefix });
      const inputEl = input?.nativeElement as HTMLInputElement;

      inputEl.value = 'Pizza Margherita';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.search()).toBe('Pizza Margherita');
    });

    it('should update input value when search model is updated externally', async () => {
      component.search.set('Calzone');
      fixture.detectChanges();
      await fixture.whenStable();

      const input = getByTestId(template, 'Input', { prefix: testIdPrefix });
      expect(input?.nativeElement.value).toBe('Calzone');
    });

    it('should emit startSearch output on submitSearch', () => {
      const emitSpy = vi.spyOn(component.startSearch, 'emit');
      const fakeEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventSpy = vi.spyOn(fakeEvent, 'preventDefault');
      const stopSpy = vi.spyOn(fakeEvent, 'stopPropagation');

      component.submitSearch(fakeEvent);

      expect(preventSpy).toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle submitSearch when event is omitted', () => {
      const emitSpy = vi.spyOn(component.startSearch, 'emit');

      component.submitSearch();

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should trigger submitSearch and emit startSearch when pressing Enter in the input', () => {
      const emitSpy = vi.spyOn(component.startSearch, 'emit');
      const input = getByTestId(template, 'Input', { prefix: testIdPrefix });
      const inputEl = input?.nativeElement as HTMLInputElement;

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      inputEl.dispatchEvent(enterEvent);
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should reset search model and focus input when clear button is clicked', () => {
      component.search.set('Focaccia');
      fixture.detectChanges();

      const input = getByTestId(template, 'Input', { prefix: testIdPrefix });
      const inputEl = input?.nativeElement as HTMLInputElement;
      const focusSpy = vi.spyOn(inputEl, 'focus');

      const clearButton = getByTestId(template, 'Clear button', { prefix: testIdPrefix });
      expect(clearButton).toBeTruthy();

      clearButton?.nativeElement.click();
      fixture.detectChanges();

      expect(component.search()).toBe('');
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should focus input when autoFocus is set to true', async () => {
      const autoFocusFixture = TestBed.createComponent(Searchbar);
      const autoFocusTemplate = autoFocusFixture.debugElement;
      const input = getByTestId(autoFocusTemplate, 'Input', { prefix: testIdPrefix });
      const inputEl = input?.nativeElement as HTMLInputElement;
      const focusSpy = vi.spyOn(inputEl, 'focus');

      autoFocusFixture.componentRef.setInput('autoFocus', true);
      autoFocusFixture.detectChanges();
      await autoFocusFixture.whenStable();

      expect(focusSpy).toHaveBeenCalled();
    });
  });
});
