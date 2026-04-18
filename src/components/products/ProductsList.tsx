'use client';

import React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toQueryParams } from '@/services/api/utils';
import { useFetchProducts } from '@/shared/hooks/useFetchData';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';

import { Button } from '../ui/button';

import ProductCard from './ProductCard';
import { cn } from '@/shared/utils/tailwind';
import { getPageNumbers } from '@/shared/utils/getPageNumbers';

type ProductListProps = {
    initialParams: ProductsQueryParams;
    updateQueryParams: (params: Partial<ProductsQueryParams>, options?: { resetPage?: boolean }) => void;
};

export default function ProductsList({ initialParams, updateQueryParams }: ProductListProps) {
    const page = Number(initialParams.page) || 1;
    const params = toQueryParams(initialParams);

    const { data, isError, error, isPlaceholderData, isFetching } = useFetchProducts(params);
    const products = data?.docs;

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!products) {
        return <div>Products not found</div>;
    }

    const { hasNextPage = false, hasPrevPage = false, prevPage, nextPage, totalPages = 1 } = data;



    return (
        <>
            <div className={cn('grid grid-cols-12 gap-6 auto-rows-fr', isPlaceholderData && 'opacity-50')}>
                {products?.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
            {products.length === 0 ? (
                <div className="text-2xl font-semibold text-center">Ничего не нашлось.</div>
            ) : (
                <div className="flex gap-2 justify-center items-center mt-8">
                    {/* Кнопка "Назад" */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQueryParams({ page: prevPage || page - 1 }, { resetPage: false })}
                        disabled={!hasPrevPage}
                        className="h-10 w-10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Номера страниц */}
                    {getPageNumbers(totalPages, page).map((pageNum, idx) => (
                        typeof pageNum === 'number' ? (
                            <Button
                                key={idx}
                                variant={pageNum === page ? "pagination" : "ghost"}
                                onClick={() => updateQueryParams({ page: pageNum }, { resetPage: false })}
                                className="h-10 w-10"
                            >
                                {pageNum}
                            </Button>
                        ) : (
                            <span key={idx} className="px-2 text-muted-foreground">
                                {pageNum}
                            </span>
                        )
                    ))}

                    {/* Кнопка "Вперед" */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQueryParams({ page: nextPage || page + 1 }, { resetPage: false })}
                        disabled={!hasNextPage}
                        className="h-10 w-10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </>
    );
}