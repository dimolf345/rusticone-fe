import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IProductUploadImage } from '@core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  imports: [NgIcon],
  selector: 'app-upload-card',
  styleUrl: './upload-card.css',
  providers: [
    provideIcons({
      heroCheck,
      heroXMark,
    }),
  ],
  template: `
    <div class="image-preview-card" data-testid="Product Card - Image item">
      <img [src]="cardInfo().previewUrl" [alt]="cardInfo().name" class="preview-thumbnail" />
      <div class="image-meta">
        <span class="image-name" [title]="cardInfo().name">{{ cardInfo().name }}</span>
        <div class="image-meta-sub">
          <span class="image-size">{{ (cardInfo().size / 1024).toFixed(0) }} KB</span>
          <span class="image-status-badge">
            @switch (cardInfo().status) {
              @case ('uploaded') {
                <span
                  class="badge badge-success badge-xs gap-1"
                  data-testid="Product Card - Image status uploaded"
                >
                  <ng-icon name="heroCheck" size="0.75rem" /> Caricata
                </span>
              }
              @case ('uploading') {
                <span
                  class="badge badge-info badge-xs gap-1"
                  data-testid="Product Card - Image status uploading"
                >
                  <span class="loading loading-spinner loading-xs" aria-hidden="true"></span>
                  In caricamento
                </span>
              }
              @case ('error') {
                <span
                  class="badge badge-error badge-xs"
                  data-testid="Product Card - Image status error"
                >
                  Errore
                </span>
              }
              @default {
                <span
                  class="badge badge-warning badge-xs"
                  data-testid="Product Card - Image status staged"
                >
                  Da caricare
                </span>
              }
            }
          </span>
        </div>
      </div>
      <button
        type="button"
        (click)="remove.emit()"
        class="remove-image-btn"
        aria-label="Rimuovi immagine"
        data-testid="Product Card - Remove image button"
      >
        <ng-icon name="heroXMark" size="1rem" />
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadCard {
  cardInfo = input.required<IProductUploadImage>();
  remove = output();
}
