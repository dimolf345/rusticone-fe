import { CardItem, ICardBadge } from '../models/card.model';
import { IProduct } from '../models/product.model';
import { Product } from '../models/product.schema';

export const DEFAULT_PRODUCT_IMAGE_FALLBACK = '';

export function productToCardItem(product: Product | IProduct): CardItem {
  const imageUrl = product.productImages?.[0]?.trim() || DEFAULT_PRODUCT_IMAGE_FALLBACK;
  const formattedPrice = `€ ${product.basePrice.toFixed(2).replace('.', ',')}`;

  const titleBadges: ICardBadge[] = [
    product.available
      ? { badgeVariant: 'badge-success badge-sm', badgeContent: 'Disponibile' }
      : { badgeVariant: 'badge-error badge-sm', badgeContent: 'Non disponibile' },
  ];

  const descriptionBadges: ICardBadge[] = (product.categories ?? []).map((cat) => ({
    badgeVariant: 'badge-ghost badge-sm',
    badgeContent: cat,
  }));

  const id =
    ('id' in product && product.id) || ('_id' in product && product._id) || undefined;

  return {
    ...(id ? { id } : {}),
    title: product.name,
    description: product.description?.trim() || '',
    imageUrl,
    imageAlt: product.name,
    titleBadges,
    descriptionBadges,
    footer: formattedPrice,
    categories: product.categories ?? [],
  };
}
