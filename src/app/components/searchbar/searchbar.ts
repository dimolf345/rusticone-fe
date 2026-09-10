import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScreenSize } from '@core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroXMark } from '@ng-icons/heroicons/outline';


@Component({
  selector: 'app-searchbar',
  imports: [NgIcon, FormsModule],
  templateUrl: './searchbar.html',
  styleUrl: './searchbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroMagnifyingGlass,
      heroXMark,
    }),
  ],
})
export class Searchbar {
  // Inputs
  readonly search = model<string>('');
  readonly placeholder = input<string>('Cerca...');
  readonly autoFocus = input(false, { transform: booleanAttribute });
  readonly size = input<ScreenSize>('mobile');

  // Outputs
  readonly startSearch = output<void>();

  // Viewchild
  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'desktop':
        return 'input-xl';
      case 'tablet':
        return 'input-lg';
      case 'mobile':
      default:
        return 'input-md';
    }
  });

  readonly #autoFocusEffect = effect(() => {
    if (this.autoFocus() && this.inputRef()) {
      this.inputRef()?.nativeElement.focus();
    }
  });

  submitSearch(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.startSearch.emit();
  }

  onClear(): void {
    this.search.set('');
    this.inputRef()?.nativeElement.focus();
  }
}
