import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Категории</Label>
                <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) =>
                        onFilterChange({
                            category: value === 'all' ? null : (value as ProductCategory),
                            author: filters.author,
                        })
                    }
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {PRODUCT_CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                                {c.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Сортировка */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Сортировка</Label>
                <Select
                    value={sortBy || 'default'}
                    onValueChange={(value) => onSortChange(value === 'default' ? null : (value as ProductsSortOption))}
                >
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Сортировка по умолчанию" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Сортировка по умолчанию</SelectItem>
                        {PRODUCTS_SORT_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    );
}
