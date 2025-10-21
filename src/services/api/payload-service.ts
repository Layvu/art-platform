import type { Author,Product} from '@/shared/types/payload-types';
import type { QueryParams } from '@/shared/types/query-params.type';

import { ApiUrlBuilder, COLLECTION_SLUGS, type CollectionSlug } from './api-url-builder';


export type PaginatedResponse<T> = {
    docs: T[];
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    nextPage: number | null;
    page: number;
    pagingCounter: number;
    prevPage: number | null;
    totalDocs: number;
    totalPages: number;
};

// Сервис для работы с Payload CMS API
export class PayloadService {
    private builder: ApiUrlBuilder;

    constructor() {
        this.builder = new ApiUrlBuilder();
    }

    // Универсальный метод для получения данных коллекции
    private async getCollection<T extends CollectionSlug>(
        slug: T,
        params: QueryParams = {},
        //    fetchOptions: RequestInit = { cache: 'force-cache', next: { revalidate: 0 } }, // ISR
        fetchOptions: RequestInit = { cache: 'no-store' }, // SSR
    ) {
        const url = this.builder.collectionWithParams(slug, params);
        const response = await fetch(url, fetchOptions);

        if (!response.ok) throw new Error(`Failed to fetch ${slug}`);
        const json = await response.json();
        return json;
    }

    async getProducts(params?: QueryParams): Promise<PaginatedResponse<Product>> {
        return this.getCollection(COLLECTION_SLUGS.Products, { ...params, depth: 1 }); // depth=1 подтянет категории
    }

    async getAuthors(params?: QueryParams): Promise<PaginatedResponse<Author>> {
        return this.getCollection(COLLECTION_SLUGS.Authors, { ...params, depth: 1 }); // depth=1 подтянет категории
    }

    async getProductBySlug(slug: string): Promise<Product | null> {
        const product = await this.getProducts({
            where: { slug: { equals: slug } },
            limit: 1,
            pagination: false,
        });
        return product.docs[0] ?? null;
    }

    async getAuthorBySlug(slug: string): Promise<Author | null> {
        const author = await this.getAuthors({
            where: { slug: { equals: slug } },
            limit: 1,
            pagination: false,
        });
        return author.docs[0] ?? null;
    }

    // private async getItem<T extends CollectionSlug>(
    //     slug: T,
    //     id: string,
    //     //    fetchOptions: RequestInit = { cache: 'force-cache', next: { revalidate: 0 } }, // ISR
    //     fetchOptions: RequestInit = { cache: 'no-store' }, // SSR
    // ) {
    //     const url = this.builder.collectionItem(slug, id);
    //     const response = await fetch(url, fetchOptions);

    //     if (!response.ok) throw new Error(`Failed to fetch ${slug}/${id}`);
    //     const json = await response.json();
    //     return json;
    // }

    // async getProduct(id: string): Promise<Product> {
    //     return this.getItem(COLLECTION_SLUGS.Products, id);
    // }

    // async getAuthor(id: string): Promise<Author> {
    //     return this.getItem(COLLECTION_SLUGS.Authors, id);
    // }


}

export const payloadService = new PayloadService();

// SSG - статика, при сборке все данные сохраняем, пользователи быстро берут значения из кеша. Нужна пересборка для обновления
// SSR - всегда актуальная информация на сайте, но больше нагрузка на сервер т.к данные генерируются при каждом запросе
// ISR - практически нет нагрузки на сервер, тк страницы кешируются, и при этом обновления данных происходят без пересборки
