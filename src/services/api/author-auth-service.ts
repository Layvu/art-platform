import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { IOperationResult, IProductResult } from '@/shared/types/api.interface';
import { UserType } from '@/shared/types/auth.interface';
import type { IAuthorUpdateInput } from '@/shared/types/author.interface';
import type { Product } from '@/shared/types/payload-types';
import type { IProductCreateInput, IProductFormData, IProductUpdateInput } from '@/shared/types/product.type';

import { ApiUrlBuilder } from './api-url-builder';

// TODO: использовать api url builder во всех сервисах
// TODO: разделить на серверные (с getAuthHeaders) и клиентские сервисы
export class AuthorAuthService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.PAYLOAD_API_KEY!;
    }

    private getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `${COLLECTION_SLUGS.USERS} API-Key ${this.apiKey}`,
        };
    }

    async authenticate(email: string, password: string): Promise<IOperationResult> {
        try {
            // Используем ApiUrlBuilder для создания URL логина
            const loginUrl = `${ApiUrlBuilder.getBaseUrl()}/api/users/login`;

            const loginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Важно для сохранения сессии // TODO ?
            });

            if (!loginResponse.ok) {
                return { success: false, error: 'Неверный email или пароль' };
            }

            const userData = await loginResponse.json();

            // Проверяем роль
            if (userData.user.role !== UserType.AUTHOR) {
                return { success: false, error: 'Доступ только для авторов' };
            }

            return { success: true };
        } catch (error) {
            console.error('Author authentication error:', error);
            return { success: false, error: 'Ошибка аутентификации' };
        }
    }

    async updateAuthorProfile(authorId: number, updates: IAuthorUpdateInput): Promise<void> {
        const authorUrl = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.AUTHORS)}/${authorId}`;

        const response = await fetch(authorUrl, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Server: Failed to update author profile');
    }

    async createAuthorProduct(productData: IProductCreateInput): Promise<Product> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.PRODUCTS);

        // Запрос на кастомный эндпоинт
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to create author product');

        const data = await response.json();
        return data.doc || data;
    }

    async updateAuthorProduct(productId: string, updates: IProductUpdateInput): Promise<Product> {
        const url = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.PRODUCTS)}/${productId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update author product');

        const data = await response.json();
        return data.doc || data;
    }

    async deleteAuthorProduct(productId: string): Promise<void> {
        const url = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.PRODUCTS)}/${productId}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Failed to delete product');
    }

    // Клиентский метод обновления профиля
    async updateProfile(updates: IAuthorUpdateInput): Promise<IOperationResult> {
        const response = await fetch(`${ApiUrlBuilder.forAuthorProfileUpdate()}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error || 'Ошибка обновления профиля' };
        }

        return { success: true };
    }

    // Клиентские методы работы с товарами
    async createProduct(productData: IProductFormData): Promise<IProductResult> {
        const res = await fetch(`${ApiUrlBuilder.forAuthorProducts()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const data = await res.json();
        if (!res.ok) {
            return { success: false, error: data.message };
        }

        return { success: true, product: data.product };
    }

    async updateProduct(productId: number, productData: IProductFormData): Promise<IProductResult> {
        const res = await fetch(`${ApiUrlBuilder.forAuthorProducts(productId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const data = await res.json();
        if (!res.ok) {
            return { success: false, error: data.message };
        }

        return { success: true, product: data.product };
    }

    async deleteProduct(productId: number): Promise<IOperationResult> {
        const res = await fetch(`${ApiUrlBuilder.forAuthorProducts(productId)}`, {
            method: 'DELETE',
        });

        const data = await res.json();
        if (!res.ok) {
            return { success: false, error: data.message || 'Ошибка удаления товара' };
        }

        return { success: true };
    }
}

export const authorAuthService = new AuthorAuthService();
