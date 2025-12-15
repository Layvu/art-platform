import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { IOperationResult } from '@/shared/types/api.interface';
import { UserType } from '@/shared/types/auth.interface';
import type { ICustomerCreateInput, ICustomerUpdateInput } from '@/shared/types/customer.interface';
import type { Customer, User } from '@/shared/types/payload-types';

import { ApiUrlBuilder } from './api-url-builder';

// TODO: разделить на серверные (с getAuthHeaders) и клиентские сервисы
export class CustomerAuthService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.PAYLOAD_API_KEY!;
    }

    private getAuthHeaders() {
        // Чтение и изменение чувствительных данных пользователей возможно только от лица главного админа. Логика проверки реализуема в access в CustomersCollection
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `${COLLECTION_SLUGS.USERS} API-Key ${this.apiKey}`,
        };
        return headers;
    }

    async authenticate(email: string, password: string): Promise<IOperationResult> {
        try {
            // Используем ApiUrlBuilder для создания URL логина
            const loginUrl = `${ApiUrlBuilder.getBaseUrl()}/api/users/login`;

            const loginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Важно для cookies // TODO ?
            });

            if (!loginResponse.ok) {
                return { success: false, error: 'Неверный email или пароль' };
            }

            const userData = await loginResponse.json();

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

    async findCustomerUserByEmail(email: string): Promise<User | null> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.USERS, {
            where: {
                email: { equals: email },
                role: { equals: UserType.CUSTOMER },
            },
            limit: 1,
        });

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch customer by email');
        }

        const data = await response.json();
        return data.docs[0] || null;
    }

    // Создание покупателя (используется только в API роутах регистрации)
    async createCustomer(customerData: ICustomerCreateInput): Promise<void> {
        // Создаем пользователя для аутентификации
        const userUrl = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.USERS);
        const userResponse = await fetch(userUrl, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                email: customerData.email,
                password: customerData.password,
                role: UserType.CUSTOMER,
            }),
        });

        if (!userResponse.ok) {
            const error = await userResponse.json();
            throw new Error(error.message || 'Failed to create user');
        }

        const user = await userResponse.json();

        // Находим созданную запись customers (создалась автоматически через хук)
        const customerRes = await fetch(
            `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS)}?where[user][equals]=${user.doc.id}&limit=1`,
            {
                headers: this.getAuthHeaders(),
            },
        );

        const customerDataRes = await customerRes.json();
        const customer = customerDataRes.docs[0];

        // Обновляем customers с дополнительными данными
        const customerUrl = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS)}/${customer.id}`;
        const updateResponse = await fetch(customerUrl, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                fullName: customerData.fullName,
                phone: customerData.phone,
            }),
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update customer with additional data');
        }
    }

    async getCustomerByUserId(userId: number): Promise<Customer> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS, {
            where: { user: { equals: userId } },
            limit: 1,
        });

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch customer by user ID');
        }

        const data = await response.json();
        return data.docs[0] || null;
    }

    async updateCustomerProfile(customerId: number, updates: ICustomerUpdateInput): Promise<void> {
        const url = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS)}/${customerId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Server: Failed to update customer profile');
    }

    // Проверка существования пользователя по email
    async checkUserExists(email: string): Promise<boolean> {
        const customerUser = await this.findCustomerUserByEmail(email);
        return !!customerUser;
    }

    // Клиентский метод регистрации
    async register(userData: ICustomerCreateInput): Promise<IOperationResult> {
        const res = await fetch(`${ApiUrlBuilder.forRegister()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        if (!res.ok) {
            return { success: false, error: data.error || 'Ошибка регистрации' };
        }

        return { success: true };
    }

    // Клиентский метод обновления профиля
    async updateProfile(updates: ICustomerUpdateInput): Promise<IOperationResult> {
        const response = await fetch(`${ApiUrlBuilder.forCustomerProfileUpdate()}`, {
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
}

export const customerAuthService = new CustomerAuthService();
