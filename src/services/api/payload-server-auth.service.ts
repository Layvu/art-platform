import { headers } from 'next/headers';

import type { ICredentials } from '@/shared/types/auth.interface';
import type { Author, Customer, Product, User } from '@/shared/types/payload-types';

// TODO: очень много где можно заменить на ApiUrlBuilder

export class PayloadServerAuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    }

    // Получение текущего пользователя (для Server Components)
    async getCurrentUser(): Promise<User | null> {
        const headersList = await headers();
        const cookies = headersList.get('cookie') || '';

        const response = await fetch(`${this.baseUrl}/api/users/me`, {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
            },
            cache: 'no-store', // TODO ?
        });

        if (!response.ok) {
            if (response.status === 401) {
                return null;
            }
            throw new Error('Не удалось получить данные пользователя');
        }

        const responseData = await response.json();
        return responseData.user || null;
    }

    // Получение полных данных покупателя по ID пользователя (для Server Components)
    async getCustomerData(userId: number): Promise<Customer> {
        const headersList = await headers();
        const cookies = headersList.get('cookie') || '';

        const response = await fetch(`${this.baseUrl}/api/customers?where[user][equals]=${userId}&limit=1&depth=1`, {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
            },
        });

        if (!response.ok) {
            throw new Error('Не удалось получить данные покупателя');
        }

        const data = await response.json();
        return data.docs[0] || null;
    }

    // Получение полных данных автора по ID пользователя (для Server Components)
    async getAuthorData(userId: number): Promise<Author> {
        const headersList = await headers();
        const cookies = headersList.get('cookie') || '';

        const response = await fetch(`${this.baseUrl}/api/authors?where[user][equals]=${userId}&limit=1&depth=1`, {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
            },
        });

        if (!response.ok) {
            throw new Error('Не удалось получить данные автора');
        }

        const data = await response.json();
        return data.docs[0] || null;
    }

    // Получение товаров автора (для Server Components)
    async getAuthorProducts(authorId: number): Promise<Product[]> {
        const headersList = await headers();
        const cookies = headersList.get('cookie') || '';

        // TODO: where[author][equals
        const response = await fetch(`${this.baseUrl}/api/products?where[author][equals]=${authorId}&depth=1`, {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
            },
        });

        if (!response.ok) {
            throw new Error('Не удалось получить товары автора');
        }

        const data = await response.json();
        return data.docs || [];
    }

    async updateUserCredentials(userId: number, updates: ICredentials): Promise<void> {
        const headersList = await headers();
        const cookies = headersList.get('cookie') || '';

        const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Не удалось обновить авторизационные данные пользователя');
    }
}

export const payloadServerAuthService = new PayloadServerAuthService();
