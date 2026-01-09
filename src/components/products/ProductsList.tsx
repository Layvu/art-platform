'use client';

import React from 'react';

import { toQueryParams } from '@/services/api/utils';
import { useFetchProducts } from '@/shared/hooks/useFetchData';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';

import { Button } from '../ui/button';

import ProductCard from './ProductCard';

type ProductListProps = {
    initialParams: ProductsQueryParams;
    updateQueryParams: (params: Partial<ProductsQueryParams>, options?: { resetPage?: boolean }) => void;
};

export default function ProductsList({ initialParams, updateQueryParams }: ProductListProps) {
    const page = Number(initialParams.page) || 1;
    const params = toQueryParams(initialParams);

    const { data, isError, error, isPlaceholderData, isFetching } = useFetchProducts(params);
    const products = data?.docs; // TODO: Это печально, по хорошему нужно вынести метод и типизировать

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!products) {
        return <div>Products not found</div>;
    }

    const { hasNextPage = false, hasPrevPage = false, prevPage, nextPage } = data;

    return (
        <>
            <div className={`card-list ${isPlaceholderData && 'opacity-50'}`}>
                {products?.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
            {products.length === 0 ? (
                <div className="text-2xl font-semibold text-center">Ничего не нашлось.</div>
            ) : (
                <div className="flex gap-2 justify-center mt-10">
                    {prevPage && (
                        <Button
                            variant="ghost"
                            onClick={() => updateQueryParams({ page: prevPage }, { resetPage: false })}
                            disabled={!hasPrevPage}
                        >
                            {page - 1}
                        </Button>
                    )}
                    <Button variant="secondary" disabled={true}>
                        {page}
                    </Button>
                    {nextPage && (
                        <Button
                            variant="ghost"
                            onClick={() => updateQueryParams({ page: nextPage }, { resetPage: false })}
                            disabled={!hasNextPage}
                        >
                            {page + 1}
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}
