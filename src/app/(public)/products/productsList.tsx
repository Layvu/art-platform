'use client';

import { useQuery } from '@tanstack/react-query';

import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { payloadService } from '@/services/api/payload-service';
import type { IProductsFilters, ProductsSortOption } from '@/shared/types/product.interface';

import { filterAndSortProducts } from './utils/products';
import { PRODUCTS_PER_PAGE } from './constants';

interface ProductsListProps {
    search: string;
    filters: IProductsFilters;
    sortBy: ProductsSortOption;
    page: number;
    onNextPage: () => void;
}

export default function ProductsList({ search, filters, sortBy, page, onNextPage }: ProductsListProps) {
    const query = useQuery({
        queryKey: ['products'],
        queryFn: () => payloadService.getProducts(),
    });

    const products = query.data;
    
    if (query.isLoading) {
        return <div>Loading...</div>;
    }
    if (query.isError) {
        return <div>Error: {query.error.message}</div>;
    }
    if(!products){
        return <div>Products not found</div>;
    }

    const filteredProducts = filterAndSortProducts(products, search, filters, sortBy);
    const paginatedProducts = filteredProducts.slice(0, page * PRODUCTS_PER_PAGE);
    const hasMore = filteredProducts.length > paginatedProducts.length;

    return (
        <>
            <div className="grid grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

            {/* Пагинация */}
            {/* TODO: вынести в отдельный компонент */}
            {hasMore && (
                <Button onClick={onNextPage} disabled={!hasMore} className="mt-4">
                    Загрузить ещё
                </Button>
            )}
        </>
    );
}
