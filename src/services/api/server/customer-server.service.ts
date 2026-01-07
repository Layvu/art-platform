import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import { UserType } from '@/shared/types/auth.interface';
import type { ICustomerCreateInput, ICustomerUpdateInput } from '@/shared/types/customer.interface';
import type { Customer } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

import { authServerService } from './auth-server.service';
import { BaseServerService } from './base-server.service';

export class CustomerServerService extends BaseServerService {
    async createCustomer(customerData: ICustomerCreateInput): Promise<void> {
        // Создаем пользователя (user) для аутентификации. Публичный доступ для создания Customer
        const user = await authServerService.createUser(customerData.email, customerData.password!, UserType.CUSTOMER);

        // Чтобы обновить профиль Customer, нам нужно действовать от лица этого пользователя
        // Так как это запрос регистрации, у нас еще нет кук в заголовках
        // => Мы выполняем серверный логин, чтобы получить токен доступа
        const sessionCookie = await authServerService.loginUser(customerData.email, customerData.password!);

        if (!sessionCookie) {
            throw new Error('Server: Failed to login as new user to setup profile');
        }

        const authHeaders = {
            'Content-Type': 'application/json',
            Cookie: sessionCookie,
        };

        // Находим созданную запись customers (создалась автоматически через хук)
        const customer = await this.getCustomerByUserId(user.id, authHeaders);

        if (!customer) throw new Error('Server: Customer entity was not created automatically');

        // Обновляем customer дополнительными данными, используя те же куки
        // Передаем authHeaders третьим аргументом, так как в headers() (в браузере) кук ещё нет
        await this.updateCustomerProfile(
            customer.id,
            {
                fullName: customerData.fullName,
                phone: customerData.phone,
            },
            authHeaders,
        );
    }

    async getCustomerByUserId(userId: number, customHeaders?: Record<string, string>): Promise<Customer> {
        const url = apiUrl.collection(COLLECTION_SLUGS.CUSTOMERS, {
            where: { user: { equals: userId } },
            limit: 1,
            depth: 0, // Нам чаще всего нужен просто ID
        });

        const headers = customHeaders || (await this.getAuthHeaders());

        const response = await fetch(url, {
            headers,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server: Failed to fetch customer. Status: ${response.status}. Body: ${errText}`);
        }

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            return data.docs[0];
        } catch (error) {
            console.error('Failed to parse customer response:', text, error);
            throw new Error('Invalid JSON received for customer');
        }
    }

    async updateCustomerProfile(
        customerId: number,
        updates: ICustomerUpdateInput,
        customHeaders?: Record<string, string>,
    ): Promise<void> {
        const url = apiUrl.item(COLLECTION_SLUGS.CUSTOMERS, customerId);

        // Если переданы кастомные заголовки (как при регистрации), используем их
        // Иначе берем заголовки из текущего запроса (как при обычном обновлении профиля)
        const headers = customHeaders || (await this.getAuthHeaders());

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: headers,
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Server: Failed to update customer profile');
    }
}

export const customerServerService = new CustomerServerService();
