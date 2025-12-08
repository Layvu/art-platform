'use client';

import { useQueries, useQuery } from '@tanstack/react-query';

import type { PaginatedResponse } from '@/services/api/payload-service';

import type { Author, Media, Product } from '../types/payload-types';
import type { QueryParams } from '../types/query-params.type';
import {
    getAuthorQueryOptions,
    getAuthorsQueryOptions,
    getProductByIdQueryOptions,
    getProductQueryOptions,
    getProductsQueryOptions,
} from '../utils/getDataQueryOptions';

export const useFetchProducts = (queryParams: QueryParams) => {
    return useQuery<PaginatedResponse<Product>>({
        ...getProductsQueryOptions({ ...queryParams }),
        placeholderData: (previousData) => {
            return previousData;
        },
    });
};

export const useFetchAuthors = (queryParams: QueryParams) => {
    return useQuery<PaginatedResponse<Author>>({
        ...getAuthorsQueryOptions({ ...queryParams }),
        placeholderData: (previousData) => {
            return previousData;
        },
    });
};

export const useFetchProduct = ({ slug }: { slug: string }) => {
    return useQuery<Product | null>(getProductQueryOptions({ slug }));
};

export const useFetchProductById = ({ id }: { id: number }) => {
    return useQuery<Product | null>(getProductByIdQueryOptions({ id }));
};

export const useProductsByIds = (ids: number[]) => {
    const queries = useQueries({
        queries: ids.map((id) => getProductByIdQueryOptions({ id })),
    });

    const isLoading = queries.some((q) => q.isLoading);
    const isError = queries.some((q) => q.isError);

    const products = queries.map((q) => q.data).filter(Boolean) as Product[];

    return {
        data: products,
        isLoading,
        isError,
    };
};

export const useFetchAuthor = ({ slug }: { slug: string }) => {
    return useQuery<Author | null>(getAuthorQueryOptions({ slug }));
};

// export const useFetchMedia = ({ id }: { id: number }) => {
//     return useQuery<Media | null>(getMediaQueryOptions({ id }));
// };
