import { useCallback, useState } from 'react';

import { debounce } from 'lodash';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { URL_SEPARATOR } from '@/shared/constants/constants';
import { PRODUCT_CATEGORIES, PRODUCTS_SORT_OPTIONS } from '@/shared/constants/products.constants';
import type { ProductsFilters, ProductsSortOptions } from '@/shared/types/query-params.type';

import SearchBar from '../shared/SearchBar';

import CategoryFilter from './CategoryFilter';
import Filters from './Filters';
import PriceFilter from './PriceFilter';
import AuthorFilter from './AuthorFilter';

interface IProductFiltersBarProps {
    filters: ProductsFilters;
    sort: ProductsSortOptions;
    onFilterChange: (filters: ProductsFilters) => void;
    onSortChange: (value: ProductsSortOptions) => void;
}

// TODO: переиспользовать, передавая категории и опции сортировки
export default function ProductFiltersBar({ filters, sort, onFilterChange, onSortChange }: IProductFiltersBarProps) {
    const [searchValue, setSearchValue] = useState<string>(filters.search || '');

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            onFilterChange({
                ...filters,
                search: value,
            });
        }, 500),
        [filters],
    );
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    };

    return (
        <div className="flex items-start gap-6">
            {/* Категории
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Категории</Label>
                {PRODUCT_CATEGORIES.map((c) => {
                    // читаем состояние текущего чекбокса на основе фильтров
                    const currentCategories = filters?.category
                        ? filters.category.split(URL_SEPARATOR).filter(Boolean)
                        : [];
                    const isChecked = currentCategories.includes(c.value);

                    return (
                        <div key={c.value}>
                            <Label className="flex items-center gap-2">
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                        const current = filters?.category?.split(URL_SEPARATOR).filter(Boolean) ?? [];
                                        const newCategories = checked
                                            ? [...new Set([...current, c.value])] // добавляем
                                            : current.filter((v) => v !== c.value); // удаляем

                                        onFilterChange({
                                            ...filters,
                                            category: newCategories.length
                                                ? newCategories.join(URL_SEPARATOR)
                                                : undefined, // чтобы убрать параметр из URL
                                        });
                                    }}
                                />
                                {c.label}
                            </Label>
                        </div>
                    );
                })}
            </div>

            

            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Сортировка</Label>
                <Select
                    value={sort}
                    onValueChange={(value) =>
                        onSortChange(value === 'default' ? undefined : (value as ProductsSortOptions))
                    }
                >
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Сортировка по умолчанию" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRODUCTS_SORT_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div> */}

            {/* Поиск */}
                <SearchBar value={searchValue} onChange={(value) => handleSearchChange(value)} />
            <div className="flex gap-2">

                <PriceFilter />
                <CategoryFilter
                    category={filters?.category}
                    onCategoryChange={(category) => onFilterChange({ ...filters, category })}
                />
                <AuthorFilter initialAuthor={filters.authors} onAuthorChange={(author) => onFilterChange({ ...filters, authors: author })}/>
                <div className="flex flex-col gap-2">
                    <Select
                        value={sort}
                        onValueChange={(value) =>
                            onSortChange(value === 'default' ? undefined : (value as ProductsSortOptions))
                        }
                    >
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Сортировка по умолчанию" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRODUCTS_SORT_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* <Filters /> */}
        </div>
    );
}
