import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  APP_PATHS,
  BaseCardAction,
  CardItem,
  ICardAction,
  ICardConfig,
  LayoutService,
  productToCardItem,
} from '@core';
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
  readonly cardItems = computed<CardItem[]>(() => {
    if (!this.productResource.hasValue()) {
      return [];
    }
    return this.productResource.value().map(productToCardItem);
  });
  protected readonly categoryOrder = DEFAULT_PRODUCT_CATEGORIES.map((c) => c.value);

  readonly searchQuery = signal<string>('');
  readonly debouncedQuery = debounced(this.searchQuery, 1000);

  readonly productActions: ICardAction[] = [
    {
      actionName: BaseCardAction.Update,
      actionLabel: 'Modifica',
      icon: 'heroPencil',
      theme: 'btn-ghost',
    },
    {
      actionName: BaseCardAction.Delete,
      actionLabel: 'Elimina',
      icon: 'heroTrash',
      theme: 'btn-ghost text-error',
    },
  ];

  readonly cardConfig = computed<ICardConfig>(() => {
    const size = this.layoutService.screenSize();

    switch (size) {
      case 'mobile':
        return {
          layout: 'horizontal',
          size: 'small',
          round: 'regular',
          border: 'sm',
        };
      case 'tablet':
      case 'desktop':
      default:
        return {
          layout: 'vertical',
          size: 'regular',
          round: 'regular',
          border: 'sm',
        };
    }
  });

  onProductAction(action: ICardAction): void {
    switch (action.actionName) {
      case BaseCardAction.Delete:
        break;
      default:
        return;
    }
  }
}

export { AdminMenu };
