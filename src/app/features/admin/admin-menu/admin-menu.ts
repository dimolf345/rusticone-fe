import { ChangeDetectionStrategy, Component, debounced, signal } from '@angular/core';
import { Searchbar } from '../../../components/searchbar/searchbar';

@Component({
  selector: 'app-admin-menu',
  imports: [Searchbar],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminMenu {
  readonly searchQuery = signal<string>('');

  debouncedQuery = debounced(this.searchQuery, 1000);
}

export { AdminMenu };
