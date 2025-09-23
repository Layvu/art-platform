'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';

import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams';
import type { IProductsFilters, IProductsUIProps, ProductsSortOption } from '@/shared/types/product.interface';

import { filterAndSortProducts, parseQueryToProductFilters } from './utils/products';
import { PRODUCTS_PER_PAGE } from './constants';
import ProductFiltersBar from './ProductFiltersBar';

// TODO: loading и error
export default function ProductsUI({ products }: IProductsUIProps) {
    const updateQueryParams = useUpdateQueryParams();
    const searchParams = useSearchParams();

    // локальные состояния
    const [search, setSearch] = useState<string>('');
    const [filters, setFilters] = useState<IProductsFilters>({ category: '', author: null });
    const [sortBy, setSortBy] = useState<ProductsSortOption>(null);
    const [page, setPage] = useState<number>(1);

    // debounced для тяжёлой фильтрации и обновления URL
    const [debouncedSearch] = useDebounce(search, 300);

    // Синхронизация со значениями из URL при монтировании / смене query
    useEffect(() => {
        // парсим window.location.search — проще и надёжнее при client-only component
        const { search, filters, sortBy, page } = parseQueryToProductFilters(searchParams?.toString() || '');

        setSearch(search);
        setFilters(filters);
        setSortBy(sortBy);
        setPage(page);
    }, [searchParams]);

    // Фильтрация, сортировка и пагинация
    const filteredProducts = useMemo(() => {
        // фильтруем по debouncedSearch, что уменьшит частоту пересчётов
        return filterAndSortProducts(products, debouncedSearch, filters, sortBy);
    }, [products, debouncedSearch, filters, sortBy]);

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice(0, page * PRODUCTS_PER_PAGE);
    }, [filteredProducts, page]);

    const hasMore = filteredProducts.length > paginatedProducts.length;

    // Хэндлеры

    // Синхронизируем debouncedSearch и URL (replace, чтобы не засорять историю)
    useEffect(() => {
        updateQueryParams({ search: debouncedSearch || null }, { replace: true, resetPage: true });
    }, [debouncedSearch, updateQueryParams]);

    const onFilterChange = (currFilters: IProductsFilters) => {
        setFilters((prev) => ({ ...prev, ...currFilters }));
        setPage(1);
        // записываем в URL (push), чтобы иметь историю переходов по разным фильтрам и сбрасываем страницу
        updateQueryParams(
            {
                category: currFilters.category || null,
                author: currFilters.author || null,
            },
            { replace: false, resetPage: true },
        );
    };

    const onSortChange = (value: ProductsSortOption) => {
        setSortBy(value);
        updateQueryParams({ sortBy: value || null }, { replace: false, resetPage: true });
    };

    const onNextPage = () => {
        const newPage = page + 1;
        setPage(newPage);
        updateQueryParams({ page: String(newPage) }, { replace: false, resetPage: false });
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Products</h1>

            {/* Поиск, фильтры и сортировка */}
            <div className="mb-4 flex gap-4 flex-wrap">
                <SearchBar value={search} onChange={setSearch} />
                <ProductFiltersBar
                    filters={filters}
                    sortBy={sortBy}
                    onFilterChange={onFilterChange}
                    onSortChange={onSortChange}
                />
            </div>

            {/* Список продуктов */}
            <div className="grid grid-cols-4 gap-4">
                {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

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
    );
}
