import { HTTP_METHODS } from '@/shared/constants/constants';
import type { IOperationResult } from '@/shared/types/api.interface';
import { UserType } from '@/shared/types/auth.interface';
import type { ICustomerCreateInput, ICustomerUpdateInput } from '@/shared/types/customer.interface';

import { apiUrl } from '../api-url-builder';

export class CustomerClientService {
    async authenticate(email: string, password: string): Promise<IOperationResult> {
        try {
            const response = await fetch(apiUrl.auth.login(), {
                method: HTTP_METHODS.POST,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Важно для cookies // TODO ?
            });

            if (!response.ok) return { success: false, error: 'Неверный email или пароль' };

            const userData = await response.json();

            // Проверяем роль
            if (userData.user.role !== UserType.CUSTOMER) {
                return { success: false, error: 'Доступ только для покупателей' };
            }

            return { success: true };
        } catch (error) {
            console.error('Customer authentication error:', error);
            return { success: false, error: 'Ошибка аутентификации' };
        }
    }

    async register(userData: ICustomerCreateInput): Promise<IOperationResult> {
        const response = await fetch(apiUrl.auth.register(), {
            method: HTTP_METHODS.POST,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error || 'Ошибка регистрации' };
        }
        return { success: true };
    }

    async updateProfile(updates: ICustomerUpdateInput): Promise<IOperationResult> {
        const response = await fetch(apiUrl.customer.profileUpdate(), {
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
}

export const customerClientService = new CustomerClientService();
