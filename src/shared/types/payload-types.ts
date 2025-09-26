import type { ProductCategory } from './product.interface';

export interface IPayloadAuthor {
    id: string;
    name: string;
    slug: string;
    bio?: string | undefined;
    avatar?: string | undefined;
    products_count: number;
    product_categories: { id: string; category: ProductCategory; _order: number }[];
    createdAt: string;
    updatedAt: string;
}

export interface IPayloadProduct {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    price: number;
    category: ProductCategory;
    author: string | IPayloadAuthor;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IPayloadForm {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export type PayloadCollection = IPayloadAuthor | IPayloadProduct;
