import { HTTP_METHODS } from '@/shared/constants/constants';
import type { IOperationResult, IProductResult } from '@/shared/types/api.interface';
import { UserType } from '@/shared/types/auth.interface';
import type { IAuthorUpdateInput } from '@/shared/types/author.interface';
import type { IProductFormData } from '@/shared/types/product.type';

import { apiUrl } from '../api-url-builder';

export class AuthorClientService {
    async authenticate(email: string, password: string): Promise<IOperationResult> {
        try {
            const response = await fetch(apiUrl.auth.login(), {
                method: HTTP_METHODS.POST,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Важно для сохранения сессии // TODO ?
            });

            if (!response.ok) {
                return { success: false, error: 'Неверный email или пароль' };
            }

            const userData = await response.json();

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

    async updateProfile(updates: IAuthorUpdateInput): Promise<IOperationResult> {
        const response = await fetch(apiUrl.author.profileUpdate(), {
            method: HTTP_METHODS.PATCH,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error || 'Ошибка обновления профиля' };
        }
        return { success: true };
    }

    async createProduct(productData: IProductFormData): Promise<IProductResult> {
        const response = await fetch(apiUrl.author.products(), {
            method: HTTP_METHODS.POST,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message };

        return { success: true, product: data.product };
    }

    async updateProduct(productId: number, productData: IProductFormData): Promise<IProductResult> {
        const response = await fetch(apiUrl.author.products(productId), {
            method: HTTP_METHODS.PATCH,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message };

        return { success: true, product: data.product };
    }

    async deleteProduct(productId: number): Promise<IOperationResult> {
        const response = await fetch(apiUrl.author.products(productId), {
            method: HTTP_METHODS.DELETE,
        });

        const data = await response.json();
        if (!response.ok) return { success: false, error: data.message || 'Ошибка удаления товара' };

        return { success: true };
    }
}

export const authorClientService = new AuthorClientService();
