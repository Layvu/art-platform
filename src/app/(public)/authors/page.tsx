import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/utils/get-query-client';
import { toAuthorsQueryParams } from '@/services/api/utils';
import type { AuthorsQueryParams } from '@/shared/types/query-params.type';
import { getAuthorsQueryOptions } from '@/shared/utils/getDataQueryOptions';

import AuthorsUI from '../../../components/authors/AuthorsUI';

export default async function AuthorsPage({ searchParams }: { searchParams: Promise<AuthorsQueryParams> }) {
    // Получаем параметры из поисковой строки
    const authorsQueryParams = await searchParams;

    // Преобразуем в QueryParams для запроса к серверу
    const queryParams = toAuthorsQueryParams(authorsQueryParams);

    // Prefetch текущей страницы и следующей
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getAuthorsQueryOptions(queryParams));
    await queryClient.prefetchQuery(
        getAuthorsQueryOptions({ ...queryParams, page: queryParams?.page ? queryParams.page + 1 : 1 }),
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AuthorsUI initialParams={authorsQueryParams} />
        </HydrationBoundary>
    );
}

// TODO: Метатеги
