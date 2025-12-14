'use client';

import React from 'react';

import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { toQueryParams } from '@/services/api/utils';
import { useFetchProducts } from '@/shared/hooks/useFetchData';
import { useUpdateQueryParams } from '@/shared/hooks/useUpdateQueryParams';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';

import ProductFiltersBar from './ProductFiltersBar';

import './products.scss';

export default function ProductsUI({ initialParams }: { initialParams: ProductsQueryParams }) {
    const page = Number(initialParams.page) || 1;
    const params = toQueryParams(initialParams);

    const { data, isError, error, isPlaceholderData, isFetching } = useFetchProducts(params);
    const products = data?.docs;

    const updateQueryParams = useUpdateQueryParams<ProductsQueryParams>();

    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!products) {
        return <div>Products not found</div>;
    }

    const { hasNextPage = false, hasPrevPage = false, totalPages = 0, prevPage, nextPage, totalDocs } = data;

    return (
        <div className='wrap'>
            <ProductFiltersBar
                filters={{
                    authors: initialParams.authors,
                    tags: initialParams.tags,
                    priceFrom: initialParams.priceFrom,
                    priceTo: initialParams.priceTo,
                    category: initialParams.category,
                    search: initialParams.search,
                }}
                sort={initialParams.sort}
                onFilterChange={(value) =>
                    updateQueryParams({
                        category: value.category,
                        authors: value.authors,
                        tags: value.tags,
                        priceFrom: value.priceFrom,
                        priceTo: value.priceTo,
                        search: value.search,
                    })
                }
                onSortChange={(value) => updateQueryParams({ sort: value })}
            />
            {totalDocs > 0 && (
                <div className="flex gap-2 mt-3">
                    <div>totalDocs: {totalDocs}</div>
                    <div>totalPages: {totalPages}</div>
                </div>
            )}
            {/* <div className={`grid grid-cols-4 gap-6 m-2.5 ${isPlaceholderData && 'opacity-50'}`}> */}
            <div className={`card-list ${isPlaceholderData && 'opacity-50'}`}>
                {products?.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
            {products.length === 0 ? (
                <div>Products not found</div>
            ) : (
                <div className="flex gap-2 mt-3">
                    {/* TODO: случай множества кликов отработать */}
                    <Button
                        onClick={() => updateQueryParams({ page: prevPage || 0 }, { resetPage: false })}
                        disabled={!hasPrevPage}
                    >
                        prev page: {page - 1}
                    </Button>
                    <Button
                        onClick={() => updateQueryParams({ page: nextPage || 2 }, { resetPage: false })}
                        disabled={!hasNextPage}
                    >
                        next page: {page + 1}
                    </Button>
                </div>
            )}
        </div>
    );
}
