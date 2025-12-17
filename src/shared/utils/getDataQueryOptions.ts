import { payloadService } from '@/services/api/payload-service';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';

import { AUTHORS_PER_PAGE } from '../constants/authors.constants';
import { PRODUCTS_PER_PAGE } from '../constants/products.constants';
import type { QueryParams } from '../types/query-params.type';

export const getProductsQueryOptions = (queryParams: QueryParams) => {
    const limit = queryParams.limit || PRODUCTS_PER_PAGE;

    const updatedQueryParams = { ...queryParams, limit };
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, updatedQueryParams],
        queryFn: () => payloadService.getProducts(updatedQueryParams),
        staleTime: 1000 * 60, // минута,
    };
};

export const getAuthorsQueryOptions = (queryParams: QueryParams) => {
    const limit = queryParams.limit || AUTHORS_PER_PAGE;

    const updatedQueryParams = { ...queryParams, limit };
    return {
        queryKey: [COLLECTION_SLUGS.AUTHORS, updatedQueryParams],
        queryFn: () => payloadService.getAuthors(updatedQueryParams),
        staleTime: 1000 * 60, // минута,
    };
};

export const getProductQueryOptions = ({ slug }: { slug: string }) => {
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, slug],
        queryFn: () => payloadService.getProductBySlug(slug),
        staleTime: 1000 * 60, // минута,
    };
};

export const getProductByIdQueryOptions = ({ id }: { id: number }) => {
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, id],
        queryFn: () => payloadService.getProductById(id),
        staleTime: 1000 * 60, // минута,
    };
};

export const getAuthorQueryOptions = ({ slug }: { slug: string }) => {
    return {
        queryKey: [COLLECTION_SLUGS.AUTHORS, slug],
        queryFn: () => payloadService.getAuthorBySlug(slug),
        staleTime: 1000 * 60, // минута,
    };
};

// TODO: возвращает весь Product, а не только slug. Причём много запросов, не оптимально - нужен фикс
export const getProductSlugQueryOptions = ({ id }: { id: number }) => {
    return {
        queryKey: [COLLECTION_SLUGS.PRODUCTS, id, 'slug'],
        queryFn: () => payloadService.getProductById(id),
        staleTime: 1000 * 60, // минута,
    };
};
// export const getMediaQueryOptions = ({ id }: { id: number }) => {
//     return {
//         queryKey: [COLLECTION_SLUGS.PRODUCTS, id],
//         queryFn: () => payloadService.getMediaById(id),
//         staleTime: 1000 * 60, // минута,
//     };
// };
