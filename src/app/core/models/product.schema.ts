import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().min(1),
  basePrice: z.number().nonnegative(),
  size: z.array(z.number()).default([1]),
  categories: z.array(z.string()).default([]),
  available: z.boolean().default(true),
  productImages: z.array(z.string()).default([]),
  uploadSessionId: z.string().optional(),
  description: z.string().optional().default(''),
  suggestedQuantity: z.number().default(1),
  addons: z.array(z.unknown()).optional().default([]),
});

export const ProductListSchema = z.preprocess((val) => {
  if (Array.isArray(val)) {
    return val;
  }
  if (val && typeof val === 'object') {
    const record = val as Record<string, unknown>;
    for (const key of ['data', 'products', 'items', 'results']) {
      if (Array.isArray(record[key])) {
        return record[key];
      }
    }
  }
  return val;
}, z.array(ProductSchema));

export type Product = z.infer<typeof ProductSchema>;
export type IProductDto = Product;
