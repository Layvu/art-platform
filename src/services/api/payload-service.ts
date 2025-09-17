import type { IProduct } from '@/shared/types/product.interface';
import { ApiUrlBuilder, COLLECTION_SLUGS, type CollectionSlug, type QueryParams } from './api-url-builder';
import type { IAuthor } from '@/shared/types/author.interface';

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

        return json.docs;
    }

    // Методы для каждой коллекции
    async getProducts(params: QueryParams = {}): Promise<IProduct[]> {
        return this.getCollection(COLLECTION_SLUGS.Products, { ...params, depth: 1 }); // depth=1 подтянет автора
    }

    async getAuthors(params: QueryParams = {}): Promise<IAuthor[]> {
        return this.getCollection(COLLECTION_SLUGS.Authors, params);
    }
}

// SSG - статика, при сборке все данные сохраняем, пользователи быстро берут значения из кеша. Нужна пересборка для обновления
// SSR - всегда актуальная информация на сайте, но больше нагрузка на сервер т.к данные генерируются при каждом запросе
// ISR - практически нет нагрузки на сервер, тк страницы кешируются, и при этом обновления данных происходят без пересборки
