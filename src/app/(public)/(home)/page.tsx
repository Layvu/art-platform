import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/shared/utils/get-query-client';
import { getProductsQueryOptions } from '@/shared/utils/getDataQueryOptions';

import HomeUI from './homeUI';

export default async function HomePage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(getProductsQueryOptions({ limit: 10 }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeUI />
        </HydrationBoundary>
    );
}
