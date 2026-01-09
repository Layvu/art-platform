import { useCallback, useState } from 'react';

import { debounce } from 'lodash';
import { AUTHORS_SORT_OPTIONS } from '@/shared/constants/authors.constants';
import type { AuthorsFilters, AuthorsSortOptions } from '@/shared/types/query-params.type';

import CategoryFilter from '../shared/CategoryFilter';
import SearchBar from '../shared/SearchBar';
import SortBar from '../shared/SortBar';

interface IAuthorFiltersBarProps {
    filters: AuthorsFilters;
    sort: AuthorsSortOptions;
    onFilterChange: (filters: AuthorsFilters) => void;
    onSortChange: (value: AuthorsSortOptions) => void;
}

// TODO: переиспользовать, передавая категории и опции сортировки
export default function AuthorsFiltersBar({ filters, sort, onFilterChange, onSortChange }: IAuthorFiltersBarProps) {
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
        <div className="flex items-start gap-6 mb-9">
            {/* Поиск */}
            <SearchBar value={searchValue} onChange={(value) => handleSearchChange(value)} />

            {/* Категории */}
            <CategoryFilter
                category={filters?.category}
                onCategoryChange={(category) => onFilterChange({ ...filters, category })}
            />

            {/* Сортировка */}
            <SortBar sort={sort} onSortChange={onSortChange} options={AUTHORS_SORT_OPTIONS} />
        </div>
    );
}
