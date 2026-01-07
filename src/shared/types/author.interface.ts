import type { Author } from './payload-types';

export type IAuthorUpdateInput = Omit<
    Author,
    'id' | 'slug' | 'user' | 'products_count' | 'product_categories' | 'createdAt' | 'updatedAt'
>;
export type IAuthorProductCategory = Exclude<Author['product_categories'], undefined | null>[number];
