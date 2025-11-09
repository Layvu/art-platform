import type { Product } from './payload-types';

export type IProductFormData = Omit<Product, 'id' | 'slug' | 'author' | 'updatedAt' | 'createdAt'>;
export type IProductCreateInput = Omit<Product, 'id' | 'slug' | 'updatedAt' | 'createdAt'>;
export type IProductUpdateInput = Partial<IProductCreateInput>;
