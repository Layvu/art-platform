'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';

import AuthorCard from '@/components/AuthorCard';
import SearchBar from '@/components/SearchBar';
import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams';
import type { AuthorsSortOption, IAuthorsFilters, IAuthorsUIProps } from '@/shared/types/author.interface';

import { filterAndSortAuthors, parseQueryToAuthorFilters } from './utils/authors';
import AuthorFiltersBar from './AuthorFiltersBar';
import { AuthorForm } from './AuthorForm';
import { AUTHORS_PER_PAGE } from './constants';

// TODO: loading и error
export default function AuthorsUI({ authors }: IAuthorsUIProps) {
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

    // Фильтрация, сортировка и пагинация
    const filteredAuthors = useMemo(() => {
        // фильтруем по debouncedSearch, что уменьшит частоту пересчётов
        return filterAndSortAuthors(authors, debouncedSearch, filters, sortBy);
    }, [authors, debouncedSearch, filters, sortBy]);

    const paginatedAuthors = useMemo(() => {
        return filteredAuthors.slice(0, page * AUTHORS_PER_PAGE);
    }, [filteredAuthors, page]);

    const hasMore = filteredAuthors.length > paginatedAuthors.length;

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

                {/* Список продуктов */}
                <div className="grid grid-cols-4 gap-4">
                    {paginatedAuthors.map((author) => (
                        <AuthorCard key={author.id} {...author} />
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-4"></div>

                {/* Пагинация */}
                {/* TODO: вынести в отдельный компонент */}
                {hasMore && (
                    <button
                        onClick={onNextPage}
                        className="mt-4 bg-primary text-white hover:bg-primary/90 rounded-md px-4 py-2 disabled:opacity-50"
                    >
                        Загрузить ещё
                    </button>
                )}
            </div>
        </>
    );
}

// TODO: Метатеги
