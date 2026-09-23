import { HttpEventType } from '@angular/common/http';
import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { APP_PATHS, PRODUCT_CATEGORIES, getByTestId } from '@core';
import { ProductsService } from '@core/services/products.service';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AddProduct from './add-product';

describe('AddProduct', () => {
  let component: AddProduct;
  let fixture: ComponentFixture<AddProduct>;
  let template: DebugElement;
  let _componentRef: ComponentRef<AddProduct>;
  let router: Router;
  let mockProductsService: { uploadProductImages: ReturnType<typeof vi.fn> };

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

    mockProductsService = {
      uploadProductImages: vi.fn().mockReturnValue(
        of({
          type: HttpEventType.Response,
          body: { uploadSessionId: 'mock-session-123' },
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [AddProduct],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: mockProductsService },
      ],
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
      expect(availabilityToggle?.nativeElement.textContent.toLowerCase()).toContain('disponibile');
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
        category: PRODUCT_CATEGORIES.Pizza,
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
      expect(availabilityToggle?.nativeElement.textContent.toLowerCase()).toContain('non disponibile');

      availabilityToggle?.nativeElement.click();
      fixture.detectChanges();

      expect(component.isAvailable()).toBe(true);
      expect(availabilityToggle?.nativeElement.textContent.toLowerCase()).toContain('disponibile');
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

    it('should stage dropped images with initial null uploadSessionId in uploadedImagesUrls and staged badge', () => {
      const mockFile = new File(['mock content'], 'margherita.jpg', { type: 'image/jpeg' });
      component.onFileDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [mockFile] },
      } as unknown as DragEvent);
      fixture.detectChanges();

      expect(component.stagedImages().length).toBe(1);
      expect(component.stagedImages()[0].status).toBe('staged');
      expect(component.uploadedImagesUrls()).toEqual({ 'margherita.jpg': null });
      expect(component.areAllImagesUploaded()).toBe(false);

      const statusBadge = getByTestId(template, 'Image status staged', { prefix: testIdPrefix });
      expect(statusBadge).toBeTruthy();
      expect(statusBadge?.nativeElement.textContent).toContain('Da caricare');

      const uploadBtn = getByTestId(template, 'Upload images button', { prefix: testIdPrefix });
      expect(uploadBtn).toBeTruthy();
      expect(uploadBtn?.nativeElement.disabled).toBe(false);
      expect(uploadBtn?.nativeElement.textContent).toContain('Carica immagini');
    });

    it('should upload images, store uploadSessionId, update badge to uploaded, and disable upload button', () => {
      const mockFile = new File(['mock content'], 'pizza.png', { type: 'image/png' });
      component.onFileDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [mockFile] },
      } as unknown as DragEvent);
      fixture.detectChanges();

      component.onUploadImages();
      fixture.detectChanges();

      expect(component.isUploadingImages()).toBe(false);
      expect(component.stagedImages()[0].status).toBe('uploaded');
      expect(component.uploadedImagesUrls()).toEqual({ 'pizza.png': 'mock-session-123' });
      expect(component.areAllImagesUploaded()).toBe(true);

      const statusBadge = getByTestId(template, 'Image status uploaded', { prefix: testIdPrefix });
      expect(statusBadge).toBeTruthy();
      expect(statusBadge?.nativeElement.textContent).toContain('Caricata');

      const uploadBtn = getByTestId(template, 'Upload images button', { prefix: testIdPrefix });
      expect(uploadBtn?.nativeElement.disabled).toBe(true);
      expect(uploadBtn?.nativeElement.textContent).toContain('Immagini caricate');
    });

    it('should re-enable upload button when a new unuploaded image is added', () => {
      const file1 = new File(['content 1'], 'img1.png', { type: 'image/png' });
      component.onFileDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [file1] },
      } as unknown as DragEvent);
      fixture.detectChanges();

      component.onUploadImages();
      fixture.detectChanges();

      expect(component.areAllImagesUploaded()).toBe(true);

      const file2 = new File(['content 2'], 'img2.png', { type: 'image/png' });
      component.onFileDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [file2] },
      } as unknown as DragEvent);
      fixture.detectChanges();

      expect(component.uploadedImagesUrls()).toEqual({
        'img1.png': 'mock-session-123',
        'img2.png': null,
      });
      expect(component.areAllImagesUploaded()).toBe(false);

      const uploadBtn = getByTestId(template, 'Upload images button', { prefix: testIdPrefix });
      expect(uploadBtn?.nativeElement.disabled).toBe(false);
    });

    it('should remove image from stagedImages and uploadedImagesUrls when clicking remove button', () => {
      const mockFile = new File(['mock content'], 'test.png', { type: 'image/png' });
      component.onFileDrop({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [mockFile] },
      } as unknown as DragEvent);
      fixture.detectChanges();

      expect(component.uploadedImagesUrls()).toEqual({ 'test.png': null });

      const removeBtn = getByTestId(template, 'Remove image button', { prefix: testIdPrefix });
      removeBtn?.nativeElement.click();
      fixture.detectChanges();

      expect(component.stagedImages().length).toBe(0);
      expect(component.uploadedImagesUrls()).toEqual({});
      const uploadBtn = getByTestId(template, 'Upload images button', { prefix: testIdPrefix });
      expect(uploadBtn).toBeFalsy();
    });

    it('should submit valid form with sizes, suggestedQuantity, and addons, navigating to ADMIN_MENU route', () => {
      component.sizes.set([1, 6, 12]);
      component.productForm.setValue({
        name: 'Teglia Rustica Margherita',
        category: PRODUCT_CATEGORIES.Pizza,
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
