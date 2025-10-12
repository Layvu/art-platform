import { payloadService, PayloadService } from '@/services/api/payload-service';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import HomeUI from './homeUI';
import { getQueryClient } from '@/lib/utils/get-query-client';

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
