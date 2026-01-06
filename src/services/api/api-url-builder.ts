import { stringify } from 'qs-esm';

import type { QueryParams } from '@/shared/types/query-params.type';

export class ApiUrlBuilder {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    }

    // Основной метод построения итогового URL (с параметрами запроса и без)
    private buildUrl(path: string, params?: QueryParams): string {
        const correctPath = path.startsWith('/') ? path : `/${path}`;
        const url = `${this.baseUrl}${correctPath}`;

        if (!params || Object.keys(params).length === 0) {
            return url;
        }

        const query = stringify(params, {
            addQueryPrefix: true,
            encodeValuesOnly: true, // важно для корректного where
            skipNulls: true,
        });

        return `${url}${query}`;
    }

    // Singleton Access
    private static instance: ApiUrlBuilder;
    public static getInstance(): ApiUrlBuilder {
        if (!ApiUrlBuilder.instance) {
            ApiUrlBuilder.instance = new ApiUrlBuilder();
        }
        return ApiUrlBuilder.instance;
    }

    // Получить URL для Payload коллекции
    public collection(slug: string, params: QueryParams = {}): string {
        return this.buildUrl(`/api/${slug}`, params);
    }

    // Получить URL для элемента Payload коллекции по slug и id
    public item(slug: string, id: string | number): string {
        return this.buildUrl(`/api/${slug}/${id}`);
    }

    // Auth Routes
    public auth = {
        login: () => this.collection('users/login'),
        logout: () => this.collection('users/logout'),
        me: () => this.collection('users/me'),
        register: () => this.collection('auth/register'),
    };

    // Customer Routes (Кастомные эндпоинты)
    public customer = {
        profileUpdate: () => this.buildUrl('/api/customer/profile/update'),
    };

    // Author Routes (Кастомные эндпоинты)
    public author = {
        profileUpdate: () => this.buildUrl('/api/author/profile/update'),
        // Если товары автора получаются через кастомный эндпоинт:
        products: (productId?: number) => {
            const path = '/api/author/products';
            return productId ? this.buildUrl(`${path}/${productId}`) : this.buildUrl(path);
        },
    };

    // Order Routes (Кастомные эндпоинты)
    public order = {
        create: () => this.buildUrl('/api/orders/create'),
        cancel: (id: number) => this.buildUrl(`/api/orders/${id}/cancel`),
    };
}

// Экспортируем единый инстанс для использования в сервисах
export const apiUrl = ApiUrlBuilder.getInstance();
