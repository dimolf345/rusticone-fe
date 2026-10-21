import { type HttpResourceRef } from '@angular/common/http';
import { ComponentRef, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { APP_PATHS, getByTestId, LayoutService, Product } from '@core';
import { MockLayoutService } from '@core/mocks';
import { ProductsService } from '@core/services/products.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CardListContainer } from '../../../components/card-list-container/card-list-container';
import { GenericCard } from '../../../components/generic-card/generic-card';
import { Searchbar } from '../../../components/searchbar/searchbar';
import AdminMenu from './admin-menu';

describe('AdminMenu', () => {
  let component: AdminMenu;
  let fixture: ComponentFixture<AdminMenu>;
  let template: DebugElement;
  let _componentRef: ComponentRef<AdminMenu>;
  let layoutService: MockLayoutService;

  const testIdPrefix = 'Admin Menu - ';

  const mockProducts: Product[] = [
    {
      id: 'p1',
      name: 'Pizza Margherita',
      basePrice: 8.5,
      size: [1],
      categories: ['Pizza'],
      available: true,
      productImages: ['https://example.com/margherita.jpg'],
      description: 'Pomodoro e mozzarella',
      suggestedQuantity: 1,
      addons: [],
    },
    {
      id: 'p2',
      name: 'Rustico Leccese',
      basePrice: 3.0,
      size: [1],
      categories: ['Rustici'],
      available: false,
      productImages: [],
      description: 'Sfoglia croccante con besciamella e pomodoro',
      suggestedQuantity: 2,
      addons: [],
    },
  ];

  const valueSig = signal<Product[]>([]);
  const loadingSig = signal<boolean>(false);
  const errorSig = signal<unknown>(undefined);

  const mockProductResource = {
    value: valueSig.asReadonly(),
    hasValue: () => errorSig() === undefined && valueSig() !== undefined,
    isLoading: loadingSig.asReadonly(),
    status: () => (loadingSig() ? 'loading' : errorSig() ? 'error' : 'resolved'),
    error: errorSig.asReadonly(),
    reload: vi.fn(),
  } as unknown as HttpResourceRef<Product[]>;

  const mockProductsService = {
    getProductsResource: vi.fn(() => mockProductResource),
  };

  beforeEach(async () => {
    valueSig.set([]);
    loadingSig.set(false);
    errorSig.set(undefined);

    await TestBed.configureTestingModule({
      imports: [AdminMenu],
      providers: [
        provideRouter([]),
        { provide: LayoutService, useClass: MockLayoutService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compileComponents();

    layoutService = TestBed.inject(LayoutService) as unknown as MockLayoutService;
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

    it('should display the main title "Gestione Menu" as an h2 element', () => {
      const mainTitle = getByTestId(template, 'Main title', { prefix: testIdPrefix });
      expect(mainTitle).toBeTruthy();
      expect(mainTitle?.nativeElement.tagName.toLowerCase()).toBe('h2');
      expect(mainTitle?.nativeElement.textContent.trim()).toBe('Gestione Menu');
    });

    it('should display the "+ Aggiungi" button linking to ADMIN_NEW_MENU_ITEM route', () => {
      const addBtn = getByTestId(template, 'Add button', { prefix: testIdPrefix });
      expect(addBtn).toBeTruthy();
      expect(addBtn?.nativeElement.textContent.trim()).toBe('+ Aggiungi');
      expect(addBtn?.attributes['href'] || addBtn?.nativeElement.getAttribute('href')).toBe(
        APP_PATHS.DASHBOARD.ADMIN_NEW_MENU_ITEM,
      );
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

    it('should display the products card list container', () => {
      const productsContainer = getByTestId(template, 'Products container', {
        prefix: testIdPrefix,
      });
      const productsList = getByTestId(template, 'Products list', { prefix: testIdPrefix });

      expect(productsContainer).toBeTruthy();
      expect(productsList).toBeTruthy();
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

    it('should bind the products resource and derived cardItems to the card list container grouped by categories', () => {
      valueSig.set(mockProducts);
      fixture.detectChanges();

      const listInstance = template.query(By.directive(CardListContainer))
        .componentInstance as CardListContainer;

      expect(listInstance.httpResource()).toBe(component.productResource);
      expect(listInstance.items()).toEqual(component.cardItems());
      expect(listInstance.groupBy()).toBe('categories');

      const genericCards = template.queryAll(By.directive(GenericCard));
      expect(genericCards.length).toBe(2);
      expect((genericCards[0].componentInstance as GenericCard).payload()?.title).toBe(
        'Pizza Margherita',
      );
      expect((genericCards[0].componentInstance as GenericCard).payload()?.footer).toBe('€ 8,50');
    });

    it('should render fallback error UI when productResource is in error state', () => {
      errorSig.set(new Error('ZodError: Invalid product payload'));
      fixture.detectChanges();

      const errorContainer = getByTestId(template, 'Error container', {
        prefix: 'Card List Container - ',
      });
      expect(errorContainer).toBeTruthy();
      expect(component.cardItems()).toEqual([]);
    });

    it('should bind layoutService screenSize to searchbar size input', () => {
      const searchbarDebugEl = template.query(By.directive(Searchbar));
      const searchbarInstance = searchbarDebugEl.componentInstance as Searchbar;

      layoutService.setScreenSize('mobile');
      fixture.detectChanges();
      expect(searchbarInstance.size()).toBe('mobile');

      layoutService.setScreenSize('tablet');
      fixture.detectChanges();
      expect(searchbarInstance.size()).toBe('tablet');

      layoutService.setScreenSize('desktop');
      fixture.detectChanges();
      expect(searchbarInstance.size()).toBe('desktop');
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
