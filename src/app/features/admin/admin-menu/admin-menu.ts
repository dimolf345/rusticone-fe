import {
  ChangeDetectionStrategy,
  Component,
  debounced,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_PATHS, LayoutService } from '@core';
import { Searchbar } from '../../../components/searchbar/searchbar';

@Component({
  selector: 'app-admin-menu',
  imports: [Searchbar, RouterLink],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminMenu {
  protected readonly paths = APP_PATHS;
  readonly layoutService = inject(LayoutService);
  readonly searchQuery = signal<string>('');
  readonly debouncedQuery = debounced(this.searchQuery, 1000);
}

export { AdminMenu };
