import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  APP_PATHS,
  DEFAULT_PRODUCT_CATEGORIES,
  DEFAULT_SUGGESTED_QUANTITIES,
  FormValidationService,
  IProduct,
  IProductCategoryOption,
  IProductUploadImage,
  ISuggestedQuantityOption,
} from '@core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroArrowUpTray,
  heroCheck,
  heroPhoto,
  heroPlus,
  heroTrash,
  heroXMark,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule, RouterLink, NgIcon],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroArrowLeft,
      heroPhoto,
      heroCheck,
      heroXMark,
      heroArrowUpTray,
      heroTrash,
      heroPlus,
    }),
  ],
})
export default class AddProduct {
  #fb = inject(FormBuilder);
  #router = inject(Router);
  #validationService = inject(FormValidationService);

  readonly paths = APP_PATHS;
  readonly categories = signal<IProductCategoryOption[]>(DEFAULT_PRODUCT_CATEGORIES);
  readonly suggestedQuantities = signal<ISuggestedQuantityOption[]>(DEFAULT_SUGGESTED_QUANTITIES);

  readonly isDragOver = signal(false);
  readonly isUploadingImages = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly stagedImages = signal<IProductUploadImage[]>([]);
  readonly uploadedImageUrls = signal<string[]>([]);

  // Sizes management: allows admin to specify single or multiple pieces/portions
  readonly sizes = signal<number[]>([1]);
  readonly customSizeInput = signal<string>('');

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly isAvailable = signal(true);

  readonly productForm = this.#fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(5), this.#validationService.noWhitespaceValidator()]],
    category: ['pizze', [Validators.required]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    suggestedQuantity: [1, [Validators.required, Validators.min(1)]],
    addons: [''],
    description: [''],
    available: [true],
  });

  readonly nameControl = this.productForm.controls.name;
  readonly categoryControl = this.productForm.controls.category;
  readonly priceControl = this.productForm.controls.basePrice;
  readonly suggestedQuantityControl = this.productForm.controls.suggestedQuantity;
  readonly addonsControl = this.productForm.controls.addons;
  readonly descriptionControl = this.productForm.controls.description;
  readonly availableControl = this.productForm.controls.available;

  readonly hasStagedImages = computed(() => this.stagedImages().length > 0);

  readonly nameError = computed(() =>
    this.#validationService.getControlError(this.nameControl, {
      isSubmitted: this.submitted(),
      fieldName: 'Il nome del prodotto',
      customMessages: {
        minlength: 'Il nome del prodotto deve contenere almeno 5 caratteri',
        required: 'Il nome del prodotto è obbligatorio',
      },
    }),
  );

  readonly categoryError = computed(() =>
    this.#validationService.getControlError(this.categoryControl, {
      isSubmitted: this.submitted(),
      fieldName: 'La categoria',
      customMessages: {
        required: 'La categoria è obbligatoria',
      },
    }),
  );

  readonly priceError = computed(() =>
    this.#validationService.getControlError(this.priceControl, {
      isSubmitted: this.submitted(),
      fieldName: 'Il prezzo',
      customMessages: {
        min: 'Il prezzo non può essere negativo',
        required: 'Il prezzo è obbligatorio',
      },
    }),
  );

  readonly suggestedQuantityError = computed(() =>
    this.#validationService.getControlError(this.suggestedQuantityControl, {
      isSubmitted: this.submitted(),
      fieldName: 'La quantità consigliata',
      customMessages: {
        min: 'La quantità consigliata per persona non può essere negativa o zero',
        required: 'La quantità consigliata è obbligatoria',
      },
    }),
  );

  toggleAvailability(): void {
    this.isAvailable.update((val) => !val);
    this.availableControl.setValue(this.isAvailable());
  }

  // Size management methods
  addCustomSize(): void {
    const val = parseInt(this.customSizeInput().trim(), 10);
    if (!isNaN(val) && val >= 1 && !this.sizes().includes(val)) {
      this.sizes.update((current) => [...current, val].sort((a, b) => a - b));
      this.customSizeInput.set('');
    }
  }

  togglePresetSize(sizeVal: number): void {
    if (this.sizes().includes(sizeVal)) {
      if (this.sizes().length > 1) {
        this.sizes.update((current) => current.filter((s) => s !== sizeVal));
      }
    } else {
      this.sizes.update((current) => [...current, sizeVal].sort((a, b) => a - b));
    }
  }

  removeSize(index: number): void {
    if (this.sizes().length <= 1) return;
    this.sizes.update((current) => current.filter((_, i) => i !== index));
  }

  onCustomSizeInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.customSizeInput.set(input.value);
  }

  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.#processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.#processFiles(Array.from(event.dataTransfer.files));
    }
  }

  removeImage(index: number): void {
    this.stagedImages.update((images) => {
      const target = images[index];
      if (target?.previewUrl && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return images.filter((_, i) => i !== index);
    });
  }

  onUploadImages(): void {
    if (this.stagedImages().length === 0) return;

    this.isUploadingImages.set(true);
    // Simulate backend image upload processing
    setTimeout(() => {
      const urls = this.stagedImages().map(
        (img) => img.previewUrl || `https://storage.rusticone.it/products/${img.name}`,
      );
      this.uploadedImageUrls.set(urls);
      this.isUploadingImages.set(false);
    }, 600);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.productForm.invalid) {
      this.#validationService.markFormGroupTouched(this.productForm);
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.productForm.getRawValue();

    const addonsRaw = formValue.addons.trim();
    const addonsArray = addonsRaw
      ? addonsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const _productPayload: IProduct = {
      name: formValue.name.trim(),
      basePrice: Number(formValue.basePrice),
      size: this.sizes().length > 0 ? this.sizes() : [1],
      categories: [formValue.category],
      available: formValue.available,
      productImages: this.uploadedImageUrls().length
        ? this.uploadedImageUrls()
        : this.stagedImages().map((img) => img.previewUrl),
      description: formValue.description?.trim() || '',
      suggestedQuantity: Number(formValue.suggestedQuantity),
      addons: addonsArray,
    };

    // Return to main menu after adding
    this.#router.navigate([APP_PATHS.DASHBOARD.ADMIN_MENU]).catch(() => {});
  }

  #processFiles(files: File[]): void {
    const validImages = files.filter((file) => file.type.startsWith('image/'));
    const newItems: IProductUploadImage[] = validImages.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    }));

    this.stagedImages.update((current) => [...current, ...newItems]);
  }
}

export { AddProduct };
