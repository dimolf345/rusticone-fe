export interface IProductCategoryOption {
  value: string;
  label: string;
  icon?: string;
}

export type ProductImageUploadStatus = 'staged' | 'uploading' | 'uploaded' | 'error';

export interface IProductUploadImage {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
  uploadSessionId?: string;
  status: ProductImageUploadStatus;
}

export interface IProductUploadResponse {
  uploadSessionId: string;
  urls?: string[];
  images?: Array<{ name: string; uploadSessionId: string }>;
}

export interface IProduct {
  name: string;
  basePrice: number;
  size: number[];
  categories: string[];
  available: boolean;
  productImages: string[];
  uploadSessionId?: string;
  description?: string;
  suggestedQuantity: number;
  addons?: unknown[];
}

export const PRODUCT_CATEGORIES = {
  Fried: 'Fritti',
  Desserts: 'Dolci',
  Beverage: 'Bevande',
  Pizza: 'Pizza',
  Pastry: 'Rustici',
  Baked: 'Cotti al forno',
} as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];

export const DEFAULT_PRODUCT_CATEGORIES: IProductCategoryOption[] = [
  { value: PRODUCT_CATEGORIES.Pizza, label: 'Pizza', icon: '🍕' },
  { value: PRODUCT_CATEGORIES.Pastry, label: 'Rustici', icon: '🥪' },
  { value: PRODUCT_CATEGORIES.Fried, label: 'Fritti', icon: '🍟' },
  { value: PRODUCT_CATEGORIES.Baked, label: 'Cotti al forno', icon: '🥖' },
  { value: PRODUCT_CATEGORIES.Desserts, label: 'Dolci', icon: '🍰' },
  { value: PRODUCT_CATEGORIES.Beverage, label: 'Bevande', icon: '🥤' },
];

export interface ISuggestedQuantityOption {
  value: number;
  label: string;
}

export const DEFAULT_SUGGESTED_QUANTITIES: ISuggestedQuantityOption[] = [
  { value: 0.8, label: '1 pz / 12 persone' },
  { value: 0.125, label: '1 pz / 8 persone' },
  { value: 1, label: '1 pz / persona' },
  { value: 2, label: '2 pz / persona' },
  { value: 3, label: '3 pz / persona' },
  { value: 4, label: '4 pz / persona' },
];

export interface IProductSizePresetOption {
  value: number;
  label: string;
}

export const DEFAULT_PRODUCT_SIZE_PRESETS: IProductSizePresetOption[] = [
  { value: 1, label: '1 (Monoporzione)' },
  { value: 6, label: '6 (Media)' },
  { value: 12, label: '12 (Teglia)' },
  { value: 24, label: '24 (Maxi)' },
];

