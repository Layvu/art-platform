import type { IProductsFilters, ProductCategory, ProductsSortOption } from '@/shared/types/product.interface';

import { PRODUCT_CATEGORIES, PRODUCTS_SORT_OPTIONS } from './constants';

interface IProductFiltersBarProps {
    filters: IProductsFilters;
    sortBy: ProductsSortOption;
    onFilterChange: (filters: IProductsFilters) => void;
    onSortChange: (value: ProductsSortOption) => void;
}

// TODO: переиспользовать, передавая категории и опции сортировки
export default function ProductFiltersBar({ filters, sortBy, onFilterChange, onSortChange }: IProductFiltersBarProps) {
    return (
        <>
            {/* Категории */}
            <select
                value={filters.category || ''}
                onChange={(e) =>
                    onFilterChange({ category: e.target.value as ProductCategory, author: filters.author })
                }
                className="px-4 py-2 border border-gray-300 rounded-md"
            >
                <option value="">Все категории</option>
                {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                        {c.label}
                    </option>
                ))}
            </select>

            {/* Сортировка */}
            <select
                value={sortBy || ''}
                onChange={(e) => onSortChange((e.target.value as ProductsSortOption) || null)}
                className="px-4 py-2 border border-gray-300 rounded-md"
            >
                <option value="">Сортировка по умолчанию</option>
                {PRODUCTS_SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>
        </>
    );
}
