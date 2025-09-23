import type { ProductCategory } from './product.interface';

export interface PayloadAuthor {
    id: string;
    name: string;
    bio?: string | undefined;
    avatar?: string | undefined;
    products_count: number;
    product_categories: { id: string; category: ProductCategory; _order: number }[];
    createdAt: string;
    updatedAt: string;
}

export interface PayloadProduct {
    id: string;
    title: string;
    description?: string | null;
    price: number;
    category: ProductCategory;
    author: string | PayloadAuthor;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type PayloadCollection = PayloadAuthor | PayloadProduct;
