import { useCallback, useState } from 'react';

import { debounce } from 'lodash';

import { PRODUCTS_SORT_OPTIONS } from '@/shared/constants/products.constants';
import type { ProductsFilters, ProductsSortOptions } from '@/shared/types/query-params.type';

import CategoryFilter from '../shared/CategoryFilter';
import SearchBar from '../shared/SearchBar';
import SortBar from '../shared/SortBar';

import AuthorFilter from './AuthorFilter';
import PriceFilter from './PriceFilter';

interface IProductFiltersBarProps {
    filters: ProductsFilters;
    sort: ProductsSortOptions;
    onFilterChange: (filters: ProductsFilters) => void;
    onSortChange: (value: ProductsSortOptions) => void;
}

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
            <SearchBar value={searchValue} onChange={(value) => handleSearchChange(value)} />
            <div className="flex gap-2">
                <PriceFilter
                    priceFrom={filters.priceFrom}
                    priceTo={filters.priceTo}
                    onPriceChange={(priceFrom, priceTo) =>
                        onFilterChange({ ...filters, priceFrom: priceFrom, priceTo: priceTo })
                    }
                />
                <CategoryFilter
                    category={filters?.category}
                    onCategoryChange={(category) => onFilterChange({ ...filters, category })}
                />
                <AuthorFilter
                    initialAuthor={filters.authors}
                    onAuthorChange={(author) => onFilterChange({ ...filters, authors: author })}
                />
                <SortBar sort={sort} onSortChange={onSortChange} options={PRODUCTS_SORT_OPTIONS} />
            </div>
        </div>
    );
}
