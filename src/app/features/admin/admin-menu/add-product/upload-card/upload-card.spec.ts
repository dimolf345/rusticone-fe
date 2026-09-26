import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getByTestId, IProductUploadImage } from '@core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadCard } from './upload-card';

describe('UploadCard', () => {
  let component: UploadCard;
  let fixture: ComponentFixture<UploadCard>;
  let template: DebugElement;
  let _componentRef: ComponentRef<UploadCard>;

  const testIdPrefix = 'Product Card - ';

  const mockUploadImage: IProductUploadImage = {
    id: 'test-image-1',
    name: 'margherita.jpg',
    size: 20480, // 20 KB
    previewUrl: 'blob:http://localhost/margherita.jpg',
    status: 'staged',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadCard);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;

    _componentRef.setInput('cardInfo', mockUploadImage);
    fixture.detectChanges();
  });

  it('should create the upload card component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the card container and preview image with proper attributes', () => {
      const card = getByTestId(template, 'Image item', { prefix: testIdPrefix });
      const img = template.nativeElement.querySelector('img.preview-thumbnail');

      expect(card).toBeTruthy();
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe(mockUploadImage.previewUrl);
      expect(img.getAttribute('alt')).toBe(mockUploadImage.name);
    });

    it('should display the file name and formatted file size', () => {
      const nameEl = template.nativeElement.querySelector('.image-name');
      const sizeEl = template.nativeElement.querySelector('.image-size');

      expect(nameEl).toBeTruthy();
      expect(nameEl.textContent?.trim()).toBe('margherita.jpg');
      expect(nameEl.getAttribute('title')).toBe('margherita.jpg');

      expect(sizeEl).toBeTruthy();
      expect(sizeEl.textContent?.trim()).toBe('20 KB');
    });

    it('should display the staged status badge by default when status is "staged"', () => {
      const stagedBadge = getByTestId(template, 'Image status staged', { prefix: testIdPrefix });
      const uploadedBadge = getByTestId(template, 'Image status uploaded', { prefix: testIdPrefix });
      const uploadingBadge = getByTestId(template, 'Image status uploading', {
        prefix: testIdPrefix,
      });
      const errorBadge = getByTestId(template, 'Image status error', { prefix: testIdPrefix });

      expect(stagedBadge).toBeTruthy();
      expect(stagedBadge?.nativeElement.textContent).toContain('Da caricare');
      expect(uploadedBadge).toBeFalsy();
      expect(uploadingBadge).toBeFalsy();
      expect(errorBadge).toBeFalsy();
    });

    it('should display the uploaded status badge when status is "uploaded"', () => {
      _componentRef.setInput('cardInfo', {
        ...mockUploadImage,
        status: 'uploaded',
      });
      fixture.detectChanges();

      const uploadedBadge = getByTestId(template, 'Image status uploaded', {
        prefix: testIdPrefix,
      });
      expect(uploadedBadge).toBeTruthy();
      expect(uploadedBadge?.nativeElement.textContent).toContain('Caricata');
    });

    it('should display the uploading status badge with spinner when status is "uploading"', () => {
      _componentRef.setInput('cardInfo', {
        ...mockUploadImage,
        status: 'uploading',
      });
      fixture.detectChanges();

      const uploadingBadge = getByTestId(template, 'Image status uploading', {
        prefix: testIdPrefix,
      });
      const spinner = uploadingBadge?.nativeElement.querySelector('.loading-spinner');

      expect(uploadingBadge).toBeTruthy();
      expect(uploadingBadge?.nativeElement.textContent).toContain('In caricamento');
      expect(spinner).toBeTruthy();
    });

    it('should display the error status badge when status is "error"', () => {
      _componentRef.setInput('cardInfo', {
        ...mockUploadImage,
        status: 'error',
      });
      fixture.detectChanges();

      const errorBadge = getByTestId(template, 'Image status error', { prefix: testIdPrefix });
      expect(errorBadge).toBeTruthy();
      expect(errorBadge?.nativeElement.textContent).toContain('Errore');
    });

    it('should display the remove button with correct aria-label', () => {
      const removeBtn = getByTestId(template, 'Remove image button', { prefix: testIdPrefix });

      expect(removeBtn).toBeTruthy();
      expect(removeBtn?.nativeElement.getAttribute('aria-label')).toBe('Rimuovi immagine');
    });
  });

  describe('Behavior', () => {
    it('should emit remove event when clicking the remove button', () => {
      const removeSpy = vi.fn();
      component.remove.subscribe(removeSpy);

      const removeBtn = getByTestId(template, 'Remove image button', { prefix: testIdPrefix });
      removeBtn?.nativeElement.click();

      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('should dynamically update displayed file name, size, and image source when cardInfo changes', () => {
      const updatedImage: IProductUploadImage = {
        id: 'test-image-2',
        name: 'calzone-rustico.png',
        size: 51200, // 50 KB
        previewUrl: 'blob:http://localhost/calzone-rustico.png',
        status: 'uploaded',
      };

      _componentRef.setInput('cardInfo', updatedImage);
      fixture.detectChanges();

      const nameEl = template.nativeElement.querySelector('.image-name');
      const sizeEl = template.nativeElement.querySelector('.image-size');
      const img = template.nativeElement.querySelector('img.preview-thumbnail');
      const uploadedBadge = getByTestId(template, 'Image status uploaded', {
        prefix: testIdPrefix,
      });

      expect(nameEl.textContent?.trim()).toBe('calzone-rustico.png');
      expect(sizeEl.textContent?.trim()).toBe('50 KB');
      expect(img.getAttribute('src')).toBe(updatedImage.previewUrl);
      expect(uploadedBadge).toBeTruthy();
    });
  });
});
