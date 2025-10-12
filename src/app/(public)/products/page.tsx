import { PayloadService, payloadService } from '@/services/api/payload-service';

import ProductsUI from './ProductsUI';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/utils/get-query-client';

export default async function ProductsPage() {
    const queryClient = getQueryClient();

    // можно будет заменить на prefetchInfiniteQuery
    await queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: () => payloadService.getProducts(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsUI />
        </HydrationBoundary>
    );
}

// TODO: Метатеги
