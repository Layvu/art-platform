import type { IOperationResult, IProductResult } from '@/shared/types/api.interface';
import { type IAuthResult, UserType } from '@/shared/types/auth.interface';
import type { IAuthorFormData, IAuthorSession, IAuthorUpdateInput } from '@/shared/types/author.interface';
import type { Author, Product } from '@/shared/types/payload-types';
import type { IProductCreateInput, IProductFormData, IProductUpdateInput } from '@/shared/types/product.type';

import { ApiUrlBuilder, COLLECTION_SLUGS } from './api-url-builder';

// TODO: использовать api url builder

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

    async authenticate(email: string, password: string): Promise<IAuthResult> {
        try {
            // Используем ApiUrlBuilder для создания URL логина
            const loginUrl = `${ApiUrlBuilder.getBaseUrl()}/api/users/login`;

            const loginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                return { success: false, error: 'Неверный email или пароль' };
            }

            const userData = await loginResponse.json();

            // Проверяем роль
            if (userData.user.role !== UserType.AUTHOR) {
                return { success: false, error: 'Доступ только для авторов' };
            }

            // Находим профиль автора
            const author = await this.getAuthorByUserId(userData.user.id);
            if (!author) {
                return { success: false, error: 'Профиль автора не найден' };
            }

            // Возвращаем только необходимые данные для сессии
            const authorSession: IAuthorSession = {
                id: userData.user.id,
                type: UserType.AUTHOR,
                authorId: author.id,
            };
            console.log('author', authorSession);

            return {
                success: true,
                user: authorSession,
            };
        } catch (error) {
            console.error('Author authentication error:', error);
            return { success: false, error: 'Ошибка аутентификации' };
        }
    }

    async getAuthorByUserId(userId: string): Promise<Author> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.AUTHORS, {
            where: { user: { equals: userId } },
            limit: 1,
        });

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch author by user ID');

        const data = await response.json();
        return data.docs[0];
    }

    async getAuthorById(authorId: number): Promise<Author> {
        const url = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.AUTHORS)}/${authorId}`;

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch author by ID');

        const data = await response.json();
        const author = data.doc || data;

        // Убираем пароль из ответа
        const { password: _, ...authorWithoutPassword } = author;

        return authorWithoutPassword;
    }

    async updateAuthorProfile(authorId: number, updates: IAuthorUpdateInput): Promise<Author> {
        const url = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.AUTHORS)}/${authorId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update author');

        const data = await response.json();
        return data.doc || data;
    }

    async getAuthorProducts(authorId: number): Promise<Product[]> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.PRODUCTS, {
            where: { author: { equals: authorId } },
        });

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        return data.docs || data;
    }

    async createAuthorProduct(productData: IProductCreateInput): Promise<Product> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.PRODUCTS);

        // Запрос на кастомный эндпоинт
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to create product');

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
        if (!response.ok) throw new Error('Failed to update product');

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
    async updateProfile(updates: IAuthorFormData): Promise<IAuthResult> {
        const res = await fetch(`${ApiUrlBuilder.forAuthorProfileUpdate()}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        const data = await res.json();
        if (!res.ok) {
            return { success: false, error: data.message };
        }

        return { success: true, user: data.author };
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
            return { success: false, error: data.message };
        }

        return { success: true };
    }
}

export const authorAuthService = new AuthorAuthService();
