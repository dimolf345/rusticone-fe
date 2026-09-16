export interface IProductCategoryOption {
  value: string;
  label: string;
  icon?: string;
}

export interface IProductUploadImage {
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
}

export interface IProduct {
  name: string;
  basePrice: number;
  size: number[];
  categories: string[];
  available: boolean;
  productImages: string[];
  description?: string;
  suggestedQuantity: number;
  addons?: unknown[];
}

export const DEFAULT_PRODUCT_CATEGORIES: IProductCategoryOption[] = [
  { value: 'pizze', label: 'Pizze', icon: '🍕' },
  { value: 'rustici', label: 'Rustici', icon: '🥪' },
  { value: 'fritti', label: 'Fritti', icon: '🍟' },
  { value: 'dolci', label: 'Dolci', icon: '🍰' },
  { value: 'bevande', label: 'Bevande', icon: '🥤' },
];

export interface ISuggestedQuantityOption {
  value: number;
  label: string;
}

export const DEFAULT_SUGGESTED_QUANTITIES: ISuggestedQuantityOption[] = [
  { value: 1, label: '1 pz / persona' },
  { value: 2, label: '2 pz / persona' },
  { value: 3, label: '3 pz / persona' },
  { value: 4, label: '4 pz / persona' },
  { value: 5, label: '5 pz / persona' },
  { value: 6, label: '6 pz / persona' },
  { value: 8, label: '8 pz / persona' },
  { value: 10, label: '10 pz / persona' },
  { value: 12, label: '12 pz / persona' },
];
