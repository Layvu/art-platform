import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { toQueryParams } from '@/services/api/utils';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getProductsQueryOptions } from '@/shared/utils/getDataQueryOptions';

import ProductsUI from '../../../components/products/ProductsUI';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ProductsQueryParams> }) {
    // Получаем параметры из поисковой строки
    const productsQueryParams = await searchParams;

    // Преобразуем в QueryParams для запроса к серверу
    const queryParams = toQueryParams(productsQueryParams);

    // Prefetch текущей страницы и следующей
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getProductsQueryOptions(queryParams));
    await queryClient.prefetchQuery(
        getProductsQueryOptions({ ...queryParams, page: queryParams?.page ? queryParams.page + 1 : 1 }),
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsUI initialParams={productsQueryParams} />
        </HydrationBoundary>
    );
}

// TODO: Метатеги
