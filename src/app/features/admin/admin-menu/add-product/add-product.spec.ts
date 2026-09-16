import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { APP_PATHS, getByTestId } from '@core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AddProduct from './add-product';

describe('AddProduct', () => {
  let component: AddProduct;
  let fixture: ComponentFixture<AddProduct>;
  let template: DebugElement;
  let _componentRef: ComponentRef<AddProduct>;
  let router: Router;

  const testIdPrefix = 'Add Product - ';

  beforeEach(async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL if not defined in jsdom
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn(
        (file: Blob | MediaSource | unknown) =>
          `blob:mock-url-${(file as File)?.name || 'file'}`,
      );
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    }

    await TestBed.configureTestingModule({
      imports: [AddProduct],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AddProduct);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the add-product component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the main page container', () => {
      const pageContainer = getByTestId(template, 'Page container', { prefix: testIdPrefix });
      expect(pageContainer).toBeTruthy();
    });

    it('should display the header with back button linking to ADMIN_MENU', () => {
      const header = getByTestId(template, 'Header container', { prefix: testIdPrefix });
      const backBtn = getByTestId(template, 'Back button', { prefix: testIdPrefix });
      const title = getByTestId(template, 'Title', { prefix: testIdPrefix });

      expect(header).toBeTruthy();
      expect(title?.nativeElement.textContent.trim()).toBe('Nuovo prodotto');
      expect(backBtn).toBeTruthy();
      expect(backBtn?.attributes['href'] || backBtn?.nativeElement.getAttribute('href')).toBe(
        APP_PATHS.DASHBOARD.ADMIN_MENU,
      );
    });

    it('should display the availability toggle in the header defaulting to "Disponibile"', () => {
      const availabilityToggle = getByTestId(template, 'Availability toggle', {
        prefix: testIdPrefix,
      });
      expect(availabilityToggle).toBeTruthy();
      expect(availabilityToggle?.nativeElement.textContent).toContain('Disponibile');
    });

    it('should display the scrollable form container and image dropzone', () => {
      const scrollContainer = getByTestId(template, 'Form scroll container', {
        prefix: testIdPrefix,
      });
      const dropzone = getByTestId(template, 'Image dropzone', { prefix: testIdPrefix });

      expect(scrollContainer).toBeTruthy();
      expect(dropzone).toBeTruthy();
      expect(dropzone?.nativeElement.textContent).toContain('Carica foto prodotto');
      expect(dropzone?.nativeElement.textContent).toContain('PNG, JPG fino a 5MB');
    });

    it('should not display upload images button when no images are staged', () => {
      const uploadBtn = getByTestId(template, 'Upload images button', { prefix: testIdPrefix });
      expect(uploadBtn).toBeFalsy();
    });

    it('should display all form inputs (name, category, price, size, suggested quantity, addons, description)', () => {
      const nameInput = getByTestId(template, 'Name input', { prefix: testIdPrefix });
      const categorySelect = getByTestId(template, 'Category select', { prefix: testIdPrefix });
      const priceInput = getByTestId(template, 'Price input', { prefix: testIdPrefix });
      const sizeContainer = getByTestId(template, 'Size container', { prefix: testIdPrefix });
      const suggestedQtySelect = getByTestId(template, 'Suggested quantity select', {
        prefix: testIdPrefix,
      });
      const addonsInput = getByTestId(template, 'Addons input', { prefix: testIdPrefix });
      const descInput = getByTestId(template, 'Description input', { prefix: testIdPrefix });

      expect(nameInput).toBeTruthy();
      expect(categorySelect).toBeTruthy();
      expect(priceInput).toBeTruthy();
      expect(sizeContainer).toBeTruthy();
      expect(suggestedQtySelect).toBeTruthy();
      expect(addonsInput).toBeTruthy();
      expect(descInput).toBeTruthy();
    });

    it('should display the fixed footer with the submit button', () => {
      const footer = getByTestId(template, 'Footer container', { prefix: testIdPrefix });
      const submitBtn = getByTestId(template, 'Submit button', { prefix: testIdPrefix });

      expect(footer).toBeTruthy();
      expect(submitBtn).toBeTruthy();
      expect(submitBtn?.nativeElement.textContent).toContain('Aggiungi al listino');
    });
  });

  describe('Behavior', () => {
    it('should initialize form with default values', () => {
      expect(component.productForm.value).toEqual({
        name: '',
        category: 'pizze',
        basePrice: 0,
        suggestedQuantity: 1,
        addons: '',
        description: '',
        available: true,
      });
      expect(component.sizes()).toEqual([1]);
    });

    it('should toggle product availability state on pill click', () => {
      const availabilityToggle = getByTestId(template, 'Availability toggle', {
        prefix: testIdPrefix,
      });

      availabilityToggle?.nativeElement.click();
      fixture.detectChanges();

      expect(component.isAvailable()).toBe(false);
      expect(availabilityToggle?.nativeElement.textContent).toContain('Non disponibile');

      availabilityToggle?.nativeElement.click();
      fixture.detectChanges();

      expect(component.isAvailable()).toBe(true);
      expect(availabilityToggle?.nativeElement.textContent).toContain('Disponibile');
    });

    it('should manage product sizes via preset buttons and custom input', () => {
      // Toggle preset 6 (Media)
      const preset6Btn = getByTestId(template, 'Size preset 6', { prefix: testIdPrefix });
      preset6Btn?.nativeElement.click();
      fixture.detectChanges();

      expect(component.sizes()).toEqual([1, 6]);

      // Add custom size 18
      const customInput = getByTestId(template, 'Custom size input', { prefix: testIdPrefix });
      const addCustomBtn = getByTestId(template, 'Add custom size button', { prefix: testIdPrefix });

      expect(customInput).toBeTruthy();
      customInput!.nativeElement.value = '18';
      customInput!.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      addCustomBtn?.nativeElement.click();
      fixture.detectChanges();

      expect(component.sizes()).toEqual([1, 6, 18]);

      // Remove the custom size (index 2)
      component.removeSize(2);
      fixture.detectChanges();

      expect(component.sizes()).toEqual([1, 6]);
    });

    it('should show validation error when product name is shorter than 5 characters on submit', () => {
      component.productForm.controls.name.setValue('Piz');
      fixture.detectChanges();

      component.onSubmit();
      fixture.detectChanges();

      const nameError = getByTestId(template, 'Name error', { prefix: testIdPrefix });
      expect(nameError).toBeTruthy();
      expect(nameError?.nativeElement.textContent).toContain(
        'Il nome del prodotto deve contenere almeno 5 caratteri',
      );
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should show error when required fields are missing on submit', () => {
      component.productForm.controls.name.setValue('');
      fixture.detectChanges();

      component.onSubmit();
      fixture.detectChanges();

      const nameError = getByTestId(template, 'Name error', { prefix: testIdPrefix });
      expect(nameError).toBeTruthy();
      expect(nameError?.nativeElement.textContent).toContain('Il nome del prodotto è obbligatorio');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should stage dropped images and show previews and the upload images button', () => {
      const mockFile = new File(['mock content'], 'margherita.jpg', { type: 'image/jpeg' });
      const dragEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [mockFile],
        },
      } as unknown as DragEvent;

      component.onFileDrop(dragEvent);
      fixture.detectChanges();

      expect(component.stagedImages().length).toBe(1);
      expect(component.stagedImages()[0].name).toBe('margherita.jpg');

      const stagedList = getByTestId(template, 'Staged images list', { prefix: testIdPrefix });
      const uploadBtn = getByTestId(template, 'Upload images button', { prefix: testIdPrefix });

      expect(stagedList).toBeTruthy();
      expect(uploadBtn).toBeTruthy();
      expect(uploadBtn?.nativeElement.textContent).toContain('Carica immagini');
    });

    it('should remove staged image when clicking remove button', () => {
      const mockFile = new File(['mock content'], 'test.png', { type: 'image/png' });
      component.onFileDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [mockFile] },
      } as unknown as DragEvent);
      fixture.detectChanges();

      expect(component.stagedImages().length).toBe(1);

      const removeBtn = getByTestId(template, 'Remove image button', { prefix: testIdPrefix });
      removeBtn?.nativeElement.click();
      fixture.detectChanges();

      expect(component.stagedImages().length).toBe(0);
      const uploadBtn = getByTestId(template, 'Upload images button', { prefix: testIdPrefix });
      expect(uploadBtn).toBeFalsy();
    });

    it('should simulate upload when clicking upload images button', async () => {
      vi.useFakeTimers();
      const mockFile = new File(['mock content'], 'pizza.png', { type: 'image/png' });
      component.onFileDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [mockFile] },
      } as unknown as DragEvent);
      fixture.detectChanges();

      component.onUploadImages();
      expect(component.isUploadingImages()).toBe(true);

      await vi.advanceTimersByTimeAsync(700);
      fixture.detectChanges();

      expect(component.isUploadingImages()).toBe(false);
      expect(component.uploadedImageUrls().length).toBe(1);
      vi.useRealTimers();
    });

    it('should submit valid form with sizes, suggestedQuantity, and addons, navigating to ADMIN_MENU route', () => {
      component.sizes.set([1, 6, 12]);
      component.productForm.setValue({
        name: 'Teglia Rustica Margherita',
        category: 'pizze',
        basePrice: 18.0,
        suggestedQuantity: 2,
        addons: 'Senza glutine, Mozzarella di bufala',
        description: 'Teglia croccante ad alta idratazione',
        available: true,
      });
      fixture.detectChanges();

      component.onSubmit();
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith([APP_PATHS.DASHBOARD.ADMIN_MENU]);
    });
  });
});
