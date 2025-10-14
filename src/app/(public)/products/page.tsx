import { Suspense } from 'react';

import { dehydrate,HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/utils/get-query-client';
import { PayloadService, payloadService } from '@/services/api/payload-service';

import ProductsUI from './ProductsUI';

export default async function ProductsPage() {
    const queryClient = getQueryClient();

    // можно будет заменить на prefetchInfiniteQuery
    await queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: () => payloadService.getProducts(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div>Loading...</div>}>
                <ProductsUI />
            </Suspense>
        </HydrationBoundary>
    );
}

// TODO: Метатеги
