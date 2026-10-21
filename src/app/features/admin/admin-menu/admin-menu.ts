import {
  ChangeDetectionStrategy,
  Component,
  debounced,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_PATHS, ICardAction, LayoutService } from '@core';
import { DEFAULT_PRODUCT_CATEGORIES } from '@core/models/product.model';
import { ProductsService } from '@core/services/products.service';
import { provideIcons } from '@ng-icons/core';
import { heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { CardListContainer } from '../../../components/card-list-container/card-list-container';
import { Searchbar } from '../../../components/searchbar/searchbar';

@Component({
  selector: 'app-admin-menu',
  imports: [Searchbar, RouterLink, CardListContainer],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroPencil,
      heroTrash,
    }),
  ],
})
export default class AdminMenu {
  // #region DEPENDENCIES
  protected readonly paths = APP_PATHS;
  readonly layoutService = inject(LayoutService);
  #productsService = inject(ProductsService);
  // #endregion

  readonly productResource = this.#productsService.getProductsResource();
  protected readonly categoryOrder = DEFAULT_PRODUCT_CATEGORIES.map((c) => c.value);

  readonly searchQuery = signal<string>('');
  readonly debouncedQuery = debounced(this.searchQuery, 1000);

  readonly productActions: ICardAction[] = [
    { actionName: 'Modifica', icon: 'heroPencil', theme: 'btn-ghost' },
    { actionName: 'Elimina', icon: 'heroTrash', theme: 'btn-ghost text-error' },
  ];

  onProductAction(action: ICardAction): void {
    // TODO: handle edit / delete / view actions
    console.log('Product action', action);
  }
}

export { AdminMenu };
