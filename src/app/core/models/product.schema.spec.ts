import { describe, expect, it } from 'vitest';
import { ProductListSchema, ProductSchema } from './product.schema';

describe('ProductSchema', () => {
  const validProductPayload = {
    id: 'prod-1',
    name: 'Pizza Margherita',
    basePrice: 8.5,
    size: [1, 6],
    categories: ['Pizza', 'Cotti al forno'],
    available: true,
    productImages: ['https://example.com/pizza.jpg'],
    description: 'Pomodoro San Marzano e mozzarella fiordilatte',
    suggestedQuantity: 1,
    addons: ['Mozzarella di bufala'],
  };

  it('should validate a complete valid product payload', () => {
    const parsed = ProductSchema.parse(validProductPayload);
    expect(parsed).toEqual(validProductPayload);
  });

  it('should apply default values for optional/defaulted fields', () => {
    const minimalPayload = {
      name: 'Rustico Leccese',
      basePrice: 2.5,
    };

    const parsed = ProductSchema.parse(minimalPayload);
    expect(parsed).toEqual({
      name: 'Rustico Leccese',
      basePrice: 2.5,
      size: [1],
      categories: [],
      available: true,
      productImages: [],
      description: '',
      suggestedQuantity: 1,
      addons: [],
    });
  });

  it('should throw a ZodError when required fields are missing or invalid', () => {
    expect(() => ProductSchema.parse({ basePrice: 8.5 })).toThrow();
    expect(() => ProductSchema.parse({ name: '', basePrice: 8.5 })).toThrow();
    expect(() => ProductSchema.parse({ name: 'Pizza', basePrice: -5 })).toThrow();
    expect(() => ProductSchema.parse({ name: 'Pizza', basePrice: 'invalid' })).toThrow();
  });

  describe('ProductListSchema', () => {
    it('should parse a direct array of products', () => {
      const result = ProductListSchema.parse([validProductPayload]);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pizza Margherita');
    });

    it('should unwrap and parse products from a wrapped response object ({ data: [...] })', () => {
      const result = ProductListSchema.parse({ data: [validProductPayload] });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pizza Margherita');
    });

    it('should throw when an item in the list is malformed', () => {
      expect(() =>
        ProductListSchema.parse([validProductPayload, { name: 'Broken', basePrice: 'NaN' }]),
      ).toThrow();
    });
  });
});
