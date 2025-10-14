import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/utils/get-query-client';
import { PayloadService,payloadService } from '@/services/api/payload-service';

import HomeUI from './homeUI';

export default async function HomePage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: () => payloadService.getProducts(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeUI />
        </HydrationBoundary>
    );
}
