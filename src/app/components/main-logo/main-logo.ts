import { booleanAttribute, Component, computed, input } from '@angular/core';

export type LogoSize = 'sm' | 'md' | 'lg';

@Component({
  imports: [],
  selector: 'app-main-logo',
  styleUrl: './main-logo.css',
  template: `
    <!-- Brand Logo -->
    <div class="relative flex justify-center">
      <div [class]="squircleClass()">
        <div [class]="innerClass()">
          <img [src]="logoSrc()" alt="Il Rusticone Logo" class="logo-image" />
        </div>
      </div>
    </div>
    @if (!onlyLogo()) {
      <!-- Brand Typography Header -->
      <header class="logo-header">
        <h1 class="brand-title">Il Rusticone</h1>
        <p class="brand-tagline">
          <span>I buffet più buoni della città</span>
          <span role="img" aria-label="pizza">🍕</span>
        </p>
      </header>
    }
  `,
})
export class MainLogo {
  readonly onlyLogo = input(false, { transform: booleanAttribute });
  readonly size = input<LogoSize>('lg');
  readonly src = input<string>('');

  readonly squircleClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'logo-squircle-sm';
      case 'md':
        return 'logo-squircle-md';
      default:
        return 'logo-squircle-lg';
    }
  });

  readonly innerClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'logo-inner-sm';
      case 'md':
        return 'logo-inner-md';
      default:
        return 'logo-inner-lg';
    }
  });

  readonly logoSrc = computed(() => {
    if (this.src()) {
      return this.src();
    }
    return this.size() === 'sm' ? 'web-app-manifest-192x192.png' : 'main-logo.png';
  });
}
