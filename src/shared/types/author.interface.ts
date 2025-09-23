import type { AUTHORS_SORT_OPTIONS } from '@/app/(public)/authors/constants';

import type { ProductCategory } from './product.interface';

export interface IAuthor {
    id: string;
    name: string;
    bio?: string;
    productsCount: number; // Общее кличество товаров автора (вычисляемое)
    productCategories: ProductCategory[]; // Категории продуктов, которые автор толкает (вычисляемое), создаёт новую таблицу
    avatar?: string;
}

export interface IAuthorsUIProps {
    authors: IAuthor[];
}

export interface IAuthorsFilters {
    productCategories: ProductCategory[];
}

export interface IAuthorFiltersBarProps {
    filters: IAuthorsFilters;
    sortBy: AuthorsSortOption;
    onFilterChange: (filters: IAuthorsFilters) => void;
    onSortChange: (value: AuthorsSortOption) => void;
}

export type AuthorsSortOption = (typeof AUTHORS_SORT_OPTIONS)[number]['value'] | null;
