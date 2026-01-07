import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import AuthorUI from '@/components/author/AuthorUI';
import { payloadDataService } from '@/services/api/server/payload-data.service';
import type { AuthorQueryParams } from '@/shared/types/query-params.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorQueryOptions } from '@/shared/utils/getDataQueryOptions';

export async function generateMetadata({ params }: { params: Promise<AuthorQueryParams> }): Promise<Metadata> {
    const { author } = await params;

    const authorData = await payloadDataService.getAuthorBySlug(author);

    if (!authorData) {
        return { title: 'Автор не найден' };
    }

    return {
        title: authorData.name,
    };
}

export default async function AuthorPage({ params }: { params: Promise<AuthorQueryParams> }) {
    const productQueryParams = await params;

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getAuthorQueryOptions({ slug: productQueryParams.author }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AuthorUI initialParams={productQueryParams} />
        </HydrationBoundary>
    );
}
