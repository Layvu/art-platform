import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import { UserType } from '@/shared/types/auth.interface';
import type { ICustomerCreateInput, ICustomerUpdateInput } from '@/shared/types/customer.interface';
import type { Customer } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

import { authServerService } from './auth-server.service';
import { BaseServerService } from './base-server.service';

export class CustomerServerService extends BaseServerService {
    async createCustomer(customerData: ICustomerCreateInput): Promise<void> {
        // Создаем пользователя (user) для аутентификации
        const user = await authServerService.createUser(customerData.email, customerData.password!, UserType.CUSTOMER);

        // Находим созданную запись customers (создалась автоматически через хук)
        const customerSearchUrl = apiUrl.collection(COLLECTION_SLUGS.CUSTOMERS, {
            where: { user: { equals: user.id } },
            limit: 1,
        });

        const customerRes = await fetch(customerSearchUrl, { headers: this.getAuthHeaders() });
        const customerDataRes = await customerRes.json();
        const customer = customerDataRes.docs[0];

        if (!customer) throw new Error('Server: Customer entity was not created automatically');

        // Обновляем customer дополнительными данными
        await this.updateCustomerProfile(customer.id, {
            fullName: customerData.fullName,
            phone: customerData.phone,
        });
    }

    async getCustomerByUserId(userId: number): Promise<Customer> {
        const url = apiUrl.collection(COLLECTION_SLUGS.CUSTOMERS, {
            where: { user: { equals: userId } },
            limit: 1,
            depth: 0, // Нам чаще всего нужен просто ID
        });

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Server: Failed to fetch customer by user ID');

        const data = await response.json();
        return data.docs[0];
    }

    async updateCustomerProfile(customerId: number, updates: ICustomerUpdateInput): Promise<void> {
        const url = apiUrl.item(COLLECTION_SLUGS.CUSTOMERS, customerId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Server: Failed to update customer profile');
    }
}

export const customerServerService = new CustomerServerService();
