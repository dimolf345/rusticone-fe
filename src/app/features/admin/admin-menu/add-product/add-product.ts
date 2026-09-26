import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  APP_PATHS,
  DEFAULT_PRODUCT_CATEGORIES,
  DEFAULT_PRODUCT_SIZE_PRESETS,
  DEFAULT_SUGGESTED_QUANTITIES,
  FormValidationService,
  IProduct,
  IProductCategoryOption,
  IProductSizePresetOption,
  IProductUploadImage,
  IProductUploadResponse,
  ISuggestedQuantityOption,
  PRODUCT_CATEGORIES,
} from '@core';
import { ProductsService } from '@core/services/products.service';
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
import { finalize, map } from 'rxjs';
import { UploadCard } from './upload-card/upload-card';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule, RouterLink, NgIcon, UploadCard],
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
  #productsService = inject(ProductsService);
  #destroyRef = inject(DestroyRef);

  readonly paths = APP_PATHS;
  readonly categories = signal<IProductCategoryOption[]>(DEFAULT_PRODUCT_CATEGORIES);
  readonly suggestedQuantities = signal<ISuggestedQuantityOption[]>(DEFAULT_SUGGESTED_QUANTITIES);
  readonly sizePresets = signal<IProductSizePresetOption[]>(DEFAULT_PRODUCT_SIZE_PRESETS);

  readonly isDragOver = signal(false);
  readonly isUploadingImages = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly stagedImages = signal<IProductUploadImage[]>([]);
  readonly uploadedImagesUrls = computed(() => {
    const map: Record<string, string | null> = {};
    for (const img of this.stagedImages()) {
      map[img.name] = img.uploadSessionId ?? null;
    }
    return map;
  });
  readonly uploadedImageUrls = computed(() =>
    this.stagedImages()
      .map((img) => img.uploadSessionId)
      .filter((val): val is string => !!val),
  );
  readonly areAllImagesUploaded = computed(() => {
    const images = this.stagedImages();
    return images.length > 0 && images.every((img) => img.status === 'uploaded');
  });

  // Sizes management: allows admin to specify single or multiple pieces/portions
  readonly sizes = signal<number[]>([1]);
  readonly customSizeInput = signal<string>('');

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly isAvailable = signal(true);

  readonly productForm = this.#fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        this.#validationService.noWhitespaceValidator(),
      ],
    ],
    category: [PRODUCT_CATEGORIES.Pizza, [Validators.required]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    suggestedQuantity: [1, [Validators.required, Validators.min(0.01)]],
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

  readonly productName = toSignal(
    this.nameControl.valueChanges.pipe(map((value) => value || 'Nuovo prodotto')),
    { initialValue: 'Nuovo prodotto' },
  );

  readonly productDescription = toSignal(
    this.descriptionControl.valueChanges.pipe(map((value) => value || 'Inserisci descrizione...')),
    { initialValue: 'Inserisci descrizione...' },
  );

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
    const pendingImages = this.stagedImages().filter((img) => img.status !== 'uploaded');
    const files = pendingImages.map((img) => img.file).filter((file): file is File => !!file);

    if (files.length === 0) return;

    this.isUploadingImages.set(true);

    const uploadingIds = new Set(pendingImages.map((img) => img.id));
    this.stagedImages.update((images) =>
      images.map((img) =>
        uploadingIds.has(img.id) ? { ...img, status: 'uploading' as const } : img,
      ),
    );

    this.#productsService
      .uploadProductImages(files)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isUploadingImages.set(false)),
      )
      .subscribe({
        next: (res: unknown) => {
          const isHttpResponse =
            typeof res === 'object' &&
            res !== null &&
            'type' in res &&
            (res as HttpEvent<unknown>).type === HttpEventType.Response;
          const body: unknown = isHttpResponse ? (res as HttpResponse<unknown>).body : res;
          if (!body) return;

          const uploadRes = body as Partial<IProductUploadResponse> & {
            sessionId?: string;
            urls?: string[];
          };
          const sessionId: string | null =
            uploadRes.uploadSessionId ||
            uploadRes.sessionId ||
            (typeof body === 'string' ? body : null);

          if (sessionId) {
            this.stagedImages.update((images) =>
              images.map((img) =>
                uploadingIds.has(img.id)
                  ? { ...img, status: 'uploaded' as const, uploadSessionId: sessionId }
                  : img,
              ),
            );
          } else if (uploadRes.images && Array.isArray(uploadRes.images)) {
            const responseMap = new Map(
              uploadRes.images.map((item) => [item.name, item.uploadSessionId]),
            );
            this.stagedImages.update((images) =>
              images.map((img) => {
                if (uploadingIds.has(img.id)) {
                  const sid = responseMap.get(img.name);
                  return {
                    ...img,
                    status: 'uploaded' as const,
                    ...(sid ? { uploadSessionId: sid } : {}),
                  };
                }
                return img;
              }),
            );
          } else if (Array.isArray(body)) {
            this.stagedImages.update((images) => {
              let idx = 0;
              return images.map((img) => {
                if (uploadingIds.has(img.id)) {
                  const val = body[idx++];
                  return {
                    ...img,
                    status: 'uploaded' as const,
                    ...(val ? { uploadSessionId: String(val) } : {}),
                  };
                }
                return img;
              });
            });
          } else if (uploadRes.urls && Array.isArray(uploadRes.urls)) {
            this.stagedImages.update((images) => {
              let idx = 0;
              return images.map((img) => {
                if (uploadingIds.has(img.id)) {
                  const val = uploadRes.urls?.[idx++];
                  return {
                    ...img,
                    status: 'uploaded' as const,
                    ...(val ? { uploadSessionId: String(val) } : {}),
                  };
                }
                return img;
              });
            });
          }
        },
        error: (err: unknown) => {
          console.error('Failed to upload images:', err);
          this.stagedImages.update((images) =>
            images.map((img) =>
              uploadingIds.has(img.id) ? { ...img, status: 'error' as const } : img,
            ),
          );
        },
      });
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
      ? addonsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const sessionIds = this.stagedImages()
      .map((img) => img.uploadSessionId)
      .filter((val): val is string => !!val);

    const _productPayload: IProduct = {
      name: formValue.name.trim(),
      basePrice: Number(formValue.basePrice),
      size: this.sizes().length > 0 ? this.sizes() : [1],
      categories: [formValue.category],
      available: formValue.available,
      productImages: sessionIds.length
        ? sessionIds
        : this.stagedImages().map((img) => img.previewUrl),
      uploadSessionId: sessionIds[0],
      description: formValue.description?.trim() || '',
      suggestedQuantity: Number(formValue.suggestedQuantity),
      addons: addonsArray,
    };

    console.log(_productPayload);

    // Return to main menu after adding
    // this.#router.navigate([APP_PATHS.DASHBOARD.ADMIN_MENU]).catch(() => {});
  }

  #processFiles(files: File[]): void {
    const validImages = files.filter((file) => file.type.startsWith('image/'));
    const newItems: IProductUploadImage[] = validImages.map((file) => {
      const uniqueId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      return {
        id: uniqueId,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        status: 'staged',
      };
    });

    this.stagedImages.update((current) => [...current, ...newItems]);
  }

  #createProductPayload() {}
}

export { AddProduct };
