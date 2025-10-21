import { stringify } from 'qs-esm';

import type { QueryParams } from '@/shared/types/query-params.type';

export const COLLECTION_SLUGS = {
    Products: 'products',
    Authors: 'authors',
    Users: 'users',
    Media: 'media',
} as const;

export type CollectionSlug = (typeof COLLECTION_SLUGS)[keyof typeof COLLECTION_SLUGS];

export class ApiUrlBuilder {
    private baseUrl: string;

    constructor(baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    // Получить URL для коллекции по slug
    collection(slug: string): string {
        return `${this.baseUrl}/api/${slug}`;
    }

    // Получить URL с параметрами запроса
    collectionWithParams(slug: string, params: QueryParams = {}): string {
        const query = stringify(params, {
            addQueryPrefix: true,
            encodeValuesOnly: true, // важно для корректного where
            skipNulls: true,
        });

        return `${this.collection(slug)}${query}`;
    }

    // Получить URL для item'а по slug и id
    // collectionItem(slug: string, id: string): string {
    //     return `${this.baseUrl}/api/${slug}/${id}`;
    // }

    // Для удобства общий метод
    static forCollection(slug: string, params?: QueryParams) {
        const builder = new ApiUrlBuilder();

        return params ? builder.collectionWithParams(slug, params) : builder.collection(slug);
    }
}
