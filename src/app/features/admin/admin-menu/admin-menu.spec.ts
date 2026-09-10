import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getByTestId } from '@core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminMenu from './admin-menu';

describe('AdminMenu', () => {
  let component: AdminMenu;
  let fixture: ComponentFixture<AdminMenu>;
  let template: DebugElement;
  let _componentRef: ComponentRef<AdminMenu>;

  const testIdPrefix = 'Admin Menu - ';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMenu);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the admin-menu component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the main page container', () => {
      const pageContainer = getByTestId(template, 'Page container', { prefix: testIdPrefix });
      expect(pageContainer).toBeTruthy();
    });

    it('should display the main title "Gestione Menu"', () => {
      const mainTitle = getByTestId(template, 'Main title', { prefix: testIdPrefix });
      expect(mainTitle).toBeTruthy();
      expect(mainTitle?.nativeElement.textContent.trim()).toBe('Gestione Menu');
    });

    it('should display the searchbar below the title', () => {
      const searchContainer = getByTestId(template, 'Search container', { prefix: testIdPrefix });
      const searchbar = getByTestId(template, 'Searchbar', { prefix: testIdPrefix });

      expect(searchContainer).toBeTruthy();
      expect(searchbar).toBeTruthy();
    });

    it('should display the search query reflection paragraph', () => {
      const previewText = getByTestId(template, 'Search preview text', { prefix: testIdPrefix });
      expect(previewText).toBeTruthy();
      expect(previewText?.nativeElement.textContent).toContain('Valore ricerca:');
    });
  });

  describe('Behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should initialize searchQuery with an empty string', () => {
      expect(component.searchQuery()).toBe('');
    });

    it('should reflect the updated searchQuery in the preview paragraph after debounce time', async () => {
      component.searchQuery.set('Rustico Leccese');
      fixture.detectChanges();

      const previewText = getByTestId(template, 'Search preview text', { prefix: testIdPrefix });
      expect(previewText?.nativeElement.textContent).not.toContain('"Rustico Leccese"');

      // Advance debounce delay and flush async promise microtasks
      await vi.advanceTimersByTimeAsync(1000);
      fixture.detectChanges();

      expect(previewText?.nativeElement.textContent).toContain('"Rustico Leccese"');
    });
  });
});
