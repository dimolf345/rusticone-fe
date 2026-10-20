import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getByTestId } from '@core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenericCard } from './generic-card';

describe('GenericCard', () => {
  let component: GenericCard;
  let fixture: ComponentFixture<GenericCard>;
  let template: DebugElement;
  let _componentRef: ComponentRef<GenericCard>;

  const testIdPrefix = 'Generic Card - ';

  const mockProduct = {
    name: 'Pizza Margherita',
    description: 'Pomodoro, mozzarella di bufala e basilico fresco',
    basePrice: 8.5,
    categories: ['Pizza', 'Cotti al forno'],
    productImages: ['https://example.com/pizza.jpg'],
    available: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericCard],
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
    it('should display card container and default title when no item is provided', () => {
      const container = getByTestId(template, 'Container', { prefix: testIdPrefix });
      const title = getByTestId(template, 'Title', { prefix: testIdPrefix });

      expect(container).toBeTruthy();
      expect(title?.nativeElement.textContent.trim()).toBe('Senza titolo');
    });

    it('should display item details correctly when item is provided', () => {
      fixture.componentRef.setInput('item', mockProduct);
      fixture.detectChanges();

      const title = getByTestId(template, 'Title', { prefix: testIdPrefix });
      const description = getByTestId(template, 'Description', { prefix: testIdPrefix });
      const price = getByTestId(template, 'Price', { prefix: testIdPrefix });
      const image = getByTestId(template, 'Image', { prefix: testIdPrefix });

      expect(title?.nativeElement.textContent.trim()).toBe('Pizza Margherita');
      expect(description?.nativeElement.textContent.trim()).toBe(
        'Pomodoro, mozzarella di bufala e basilico fresco',
      );
      expect(price?.nativeElement.textContent.trim()).toContain('8.50 €');
      expect(image?.attributes['src'] || image?.nativeElement.getAttribute('src')).toBe(
        'https://example.com/pizza.jpg',
      );
    });

    it('should display category badges for each category in item', () => {
      fixture.componentRef.setInput('item', mockProduct);
      fixture.detectChanges();

      const badgesContainer = getByTestId(template, 'Badges container', { prefix: testIdPrefix });
      expect(badgesContainer).toBeTruthy();

      const badges = template.queryAll(By.css('.category-badge'));
      expect(badges.length).toBe(2);
      expect(badges[0].nativeElement.textContent.trim()).toBe('Pizza');
      expect(badges[1].nativeElement.textContent.trim()).toBe('Cotti al forno');
    });

    it('should display unavailable badge when available is false', () => {
      fixture.componentRef.setInput('item', { ...mockProduct, available: false });
      fixture.detectChanges();

      const unavailableBadge = getByTestId(template, 'Unavailable badge', {
        prefix: testIdPrefix,
      });
      expect(unavailableBadge).toBeTruthy();
      expect(unavailableBadge?.nativeElement.textContent.trim()).toBe('Esaurito');
    });

    it('should display action buttons (edit and delete)', () => {
      const editBtn = getByTestId(template, 'Edit button', { prefix: testIdPrefix });
      const deleteBtn = getByTestId(template, 'Delete button', { prefix: testIdPrefix });

      expect(editBtn).toBeTruthy();
      expect(deleteBtn).toBeTruthy();
    });
  });

  describe('Behavior', () => {
    it('should emit action event with "edit" when edit button is clicked', () => {
      fixture.componentRef.setInput('item', mockProduct);
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.action.subscribe(emitSpy);

      const editBtn = getByTestId(template, 'Edit button', { prefix: testIdPrefix });
      editBtn?.nativeElement.click();

      expect(emitSpy).toHaveBeenCalledWith({
        action: 'edit',
        item: mockProduct,
      });
    });

    it('should emit action event with "delete" when delete button is clicked', () => {
      fixture.componentRef.setInput('item', mockProduct);
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.action.subscribe(emitSpy);

      const deleteBtn = getByTestId(template, 'Delete button', { prefix: testIdPrefix });
      deleteBtn?.nativeElement.click();

      expect(emitSpy).toHaveBeenCalledWith({
        action: 'delete',
        item: mockProduct,
      });
    });

    it('should emit action event with "select" when card container is clicked', () => {
      fixture.componentRef.setInput('item', mockProduct);
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.action.subscribe(emitSpy);

      const container = getByTestId(template, 'Container', { prefix: testIdPrefix });
      container?.nativeElement.click();

      expect(emitSpy).toHaveBeenCalledWith({
        action: 'select',
        item: mockProduct,
      });
    });
  });
});
