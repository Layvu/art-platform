'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResponse } from '@/services/api/payload-service';

import type { Author, Product } from '../types/payload-types';
import type { QueryParams } from '../types/query-params.type';
import { getAuthorQueryOptions,getAuthorsQueryOptions, getProductQueryOptions, getProductsQueryOptions } from '../utils/getDataQueryOptions';

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

export const useFetchAuthor = ({ slug }: { slug: string }) => {
    return useQuery<Author | null>(getAuthorQueryOptions({ slug }));
};
