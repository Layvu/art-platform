import { PayloadService, payloadService } from '@/services/api/payload-service';

import AuthorsUI from './AuthorsUI';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/utils/get-query-client';

export default async function AuthorsPage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['authors'],
        queryFn: () => payloadService.getAuthors(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AuthorsUI />
        </HydrationBoundary>
    );
}

// TODO: Метатеги
