import type { IAuthor } from '@/shared/types/author.interface';
import type { IPayloadAuthor, IPayloadProduct, PayloadCollection } from '@/shared/types/payload-types';
import type { IProduct } from '@/shared/types/product.interface';

import { ApiUrlBuilder, COLLECTION_SLUGS, type CollectionSlug, type QueryParams } from './api-url-builder';
import { mapIPayloadAuthorToIAuthor } from './utils';

// Сервис для работы с Payload CMS API
export class PayloadService {
    private builder: ApiUrlBuilder;

    constructor() {
        this.builder = new ApiUrlBuilder();
    }

    // { next: { revalidate: 300 } } // ISR

    // Универсальный метод для получения данных коллекции
    private async getCollection<T extends CollectionSlug>(
        slug: T,
        params: QueryParams = {},
        fetchOptions: RequestInit = { cache: 'no-store' }, // SSG для тестирования по умолчанию, сменить на ISR
    ) {
        const url = this.builder.collectionWithParams(slug, params);
        const response = await fetch(url, fetchOptions);

        if (!response.ok) throw new Error(`Failed to fetch ${slug}`);
        const json = await response.json();

        if (!json.docs) throw new Error(`No ${slug} found`);

        // Не используем спред оператор, чтобы не записать на клиент лишние типы из бд (created_at, updated_at)
        return json.docs.map((doc: PayloadCollection) => {
            switch (slug) {
                case COLLECTION_SLUGS.AUTHORS:
                    return mapIPayloadAuthorToIAuthor(doc as IPayloadAuthor);
                case COLLECTION_SLUGS.PRODUCTS: {
                    const product = doc as IPayloadProduct;
                    return {
                        id: product.id,
                        title: product.title,
                        slug: product.slug,
                        description: product.description,
                        price: product.price,
                        category: product.category,
                        author:
                            typeof product.author === 'string'
                                ? { id: product.author }
                                : mapIPayloadAuthorToIAuthor(product.author),
                        image: product.image,
                    } as IProduct;
                }
                default:
                    return doc;
            }
        });
    }

    // Методы для каждой коллекции
    async getProducts(params: QueryParams = {}): Promise<IProduct[]> {
        return this.getCollection(COLLECTION_SLUGS.PRODUCTS, { ...params, depth: 1 }); // depth=1 подтянет автора
    }

    async getProductBySlug(slug: string): Promise<IProduct | null> {
        const [product] = await this.getProducts({
            where: { slug: { equals: slug } },
            limit: 1,
            pagination: false,
        });
        return product ?? null;
    }

    async getAuthors(params: QueryParams = {}): Promise<IAuthor[]> {
        return this.getCollection(COLLECTION_SLUGS.AUTHORS, { ...params, depth: 1 }); // depth=1 подтянет категории
    }

    async getAuthorBySlug(slug: string): Promise<IAuthor | null> {
        const [product] = await this.getAuthors({
            where: { slug: { equals: slug } },
            limit: 1,
            pagination: false,
        });
        return product ?? null;
    }
}

// SSG - статика, при сборке все данные сохраняем, пользователи быстро берут значения из кеша. Нужна пересборка для обновления
// SSR - всегда актуальная информация на сайте, но больше нагрузка на сервер т.к данные генерируются при каждом запросе
// ISR - практически нет нагрузки на сервер, тк страницы кешируются, и при этом обновления данных происходят без пересборки
