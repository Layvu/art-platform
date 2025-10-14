import { Suspense } from 'react';

import { dehydrate,HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/utils/get-query-client';
import { PayloadService, payloadService } from '@/services/api/payload-service';

import AuthorsUI from './AuthorsUI';

export default async function AuthorsPage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['authors'],
        queryFn: () => payloadService.getAuthors(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div>Loading...</div>}>
                <AuthorsUI />
            </Suspense>
        </HydrationBoundary>
    );
}

// TODO: Метатеги
