import { describe, expect, it } from 'vitest';
import { Product } from '../models/product.schema';
import { DEFAULT_PRODUCT_IMAGE_FALLBACK, productToCardItem } from './product-card.mapper';

describe('productToCardItem', () => {
  const fullProduct: Product = {
    id: 'p-101',
    name: 'Pizza Rustica Speciale',
    basePrice: 12.5,
    size: [1, 6],
    categories: ['Pizza', 'Cotti al forno'],
    available: true,
    productImages: ['https://example.com/rustica.webp', 'https://example.com/rustica-2.webp'],
    description: 'Mozzarella di bufala, salsiccia e datterini',
    suggestedQuantity: 1,
    addons: ['Senza glutine'],
  };

  it('should map a standard Product to a CardItem correctly', () => {
    const cardItem = productToCardItem(fullProduct);

    expect(cardItem).toEqual({
      id: 'p-101',
      title: 'Pizza Rustica Speciale',
      description: 'Mozzarella di bufala, salsiccia e datterini',
      imageUrl: 'https://example.com/rustica.webp',
      imageAlt: 'Pizza Rustica Speciale',
      titleBadges: [{ badgeVariant: 'badge-success badge-sm', badgeContent: 'Disponibile' }],
      descriptionBadges: [
        { badgeVariant: 'badge-ghost badge-sm', badgeContent: 'Pizza' },
        { badgeVariant: 'badge-ghost badge-sm', badgeContent: 'Cotti al forno' },
      ],
      footer: '€ 12,50',
      categories: ['Pizza', 'Cotti al forno'],
    });
  });

  it('should handle missing optional fields and unavailable status gracefully', () => {
    const minimalProduct: Product = {
      name: 'Acqua Naturale',
      basePrice: 2,
      size: [1],
      categories: [],
      available: false,
      productImages: [],
      description: '',
      suggestedQuantity: 1,
      addons: [],
    };

    const cardItem = productToCardItem(minimalProduct);

    expect(cardItem.id).toBeUndefined();
    expect(cardItem.title).toBe('Acqua Naturale');
    expect(cardItem.description).toBe('');
    expect(cardItem.footer).toBe('€ 2,00');
    expect(cardItem.titleBadges).toEqual([
      { badgeVariant: 'badge-error badge-sm', badgeContent: 'Non disponibile' },
    ]);
    expect(cardItem.descriptionBadges).toEqual([]);
    expect(cardItem.categories).toEqual([]);
  });

  it('should fall back to DEFAULT_PRODUCT_IMAGE_FALLBACK when productImages is empty or whitespace', () => {
    const productNoImg: Product = {
      ...fullProduct,
      productImages: ['   '],
    };

    const cardItem = productToCardItem(productNoImg);
    expect(cardItem.imageUrl).toBe(DEFAULT_PRODUCT_IMAGE_FALLBACK);
  });
});
