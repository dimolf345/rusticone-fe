import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-main-logo',
  styles: `
    :host {
      display: block;
    }
    @reference "#styles";

    .logo-squircle {
      @apply flex h-24 w-24 items-center justify-center rounded-3xl bg-[#c34e3a] p-2 shadow-lg shadow-[#c34e3a]/25 ring-4 ring-[#f4dbcf] hover:scale-105 transition-transform duration-300 sm:h-28 sm:w-28;
    }

    .logo-inner {
      @apply flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-inner;
    }

    .logo-image {
      @apply h-full w-full object-contain;
    }

    .logo-header {
      @apply mt-3 text-center sm:mt-4;
    }

    .brand-title {
      @apply font-display text-3xl font-black leading-tight tracking-tight text-[#b83d28] sm:text-4xl;
    }

    .brand-tagline {
      @apply mt-0.5 flex items-center justify-center gap-1.5 text-xs font-medium text-stone-600 sm:text-sm;
    }
  `,
  template: `   
    <!-- Brand Logo -->
    <div class="relative hover:scale-105 flex justify-center">
      <div class="logo-squircle">
        <div class="logo-inner">
          <img src="main-logo.png" alt="Il Rusticone Logo" class="logo-image" />
        </div>
      </div>
    </div>

    <!-- Brand Typography Header -->
    <header class="logo-header">
      <h1 class="brand-title">Il Rusticone</h1>
      <p class="brand-tagline">
        <span>I buffet più buoni della città</span>
        <span role="img" aria-label="pizza">🍕</span>
      </p>
    </header>`,
})
export class MainLogo { }
