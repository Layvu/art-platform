import type { PRODUCT_CATEGORIES, PRODUCTS_SORT_OPTIONS } from '@/app/(public)/products/constants';

import type { IAuthor } from './author.interface';

export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    category: ProductCategory;
    author: IAuthor;
    image?: string;
}

export interface IProductsUIProps {
    products: IProduct[];
}

export interface IProductsFilters {
    category: ProductCategory;
    author: string | null;
}

export interface IProductsPagination {
    page: number;
}

export type ProductsSortOption = (typeof PRODUCTS_SORT_OPTIONS)[number]['value'] | null;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];
