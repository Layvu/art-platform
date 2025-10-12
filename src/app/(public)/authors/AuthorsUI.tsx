'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';

import SearchBar from '@/components/SearchBar';
import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams';
import type { AuthorsSortOption, IAuthorsFilters } from '@/shared/types/author.interface';

import { parseQueryToAuthorFilters } from './utils/authors';
import AuthorFiltersBar from './AuthorFiltersBar';
import { AuthorForm } from './AuthorForm';
import AuthorsList from './AuthorsList';

// TODO: loading и error
export default function AuthorsUI() {
    const updateQueryParams = useUpdateQueryParams();
    const searchParams = useSearchParams();

    // локальные состояния
    const [search, setSearch] = useState<string>('');
    const [filters, setFilters] = useState<IAuthorsFilters>({ productCategories: [] });
    const [sortBy, setSortBy] = useState<AuthorsSortOption>(null);
    const [page, setPage] = useState<number>(1);

    // debounced для тяжёлой фильтрации и обновления URL
    const [debouncedSearch] = useDebounce(search, 300);

    // Синхронизация со значениями из URL при монтировании / смене query
    useEffect(() => {
        // парсим window.location.search — проще и надёжнее при client-only component
        const { search, filters, sortBy, page } = parseQueryToAuthorFilters(searchParams?.toString() || '');

        setSearch(search);
        setFilters(filters);
        setSortBy(sortBy);
        setPage(page);
    }, [searchParams]);

    // Хэндлеры
    // Синхронизируем debouncedSearch и URL (replace, чтобы не засорять историю)
    useEffect(() => {
        updateQueryParams({ search: debouncedSearch || null }, { replace: true, resetPage: true });
    }, [debouncedSearch, updateQueryParams]);

    const onFilterChange = (currFilters: IAuthorsFilters) => {
        setFilters((prev) => ({ ...prev, ...currFilters }));
        setPage(1);

        updateQueryParams(
            {
                productCategories: currFilters.productCategories.length
                    ? currFilters.productCategories.join(',')
                    : null,
            },
            { replace: false, resetPage: true },
        );
    };

    const onSortChange = (value: AuthorsSortOption) => {
        setSortBy(value);
        updateQueryParams({ sortBy: value || null }, { replace: false, resetPage: true });
    };

    const onNextPage = () => {
        const newPage = page + 1;
        setPage(newPage);
        updateQueryParams({ page: String(newPage) }, { replace: false, resetPage: false });
    };

    return (
        <>
            <div className="max-w-6xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Authors</h1>

                <AuthorForm />

                {/* Поиск, фильтры и сортировка */}
                <div className="flex items-center gap-4 mb-6">
                    <SearchBar value={search} onChange={setSearch} />
                    <AuthorFiltersBar
                        filters={filters}
                        sortBy={sortBy}
                        onFilterChange={onFilterChange}
                        onSortChange={onSortChange}
                    />
                </div>

                {/* Список авторов */}
                <AuthorsList {...{debouncedSearch, filters, sortBy, page, onNextPage}} />
              
            </div>
        </>
    );
}

// TODO: Метатеги
