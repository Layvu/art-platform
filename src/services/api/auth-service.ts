import type { ICustomer } from '@/shared/types/customer.interface';
import { ApiUrlBuilder, COLLECTION_SLUGS } from './api-url-builder';
import { compare, hash } from 'bcryptjs';
import type { IAuthResult } from '@/shared/types/auth.interface';
import { PAGES } from '@/config/public-pages.config';

export class AuthService {
    // private builder: ApiUrlBuilder;
    private apiKey: string;

    constructor() {
        // this.builder = new ApiUrlBuilder();
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

    async authenticate(email: string, password: string): Promise<IAuthResult> {
        try {
            const customer = await this.findCustomerByEmail(email);

            if (!customer) {
                return { success: false, error: 'Пользователь не найден' };
            }

            const isValidPassword = await compare(password, customer.password!);
            if (!isValidPassword) {
                return { success: false, error: 'Неверный пароль' };
            }

            // Убираем пароль из ответа
            const { password: _, ...userWithoutPassword } = customer;

            return {
                success: true,
                user: userWithoutPassword,
            };
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: 'Ошибка при аутентификации',
            };
        }
    }

    async findCustomerByEmail(email: string): Promise<ICustomer | null> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS, {
            where: { email: { equals: email } },
            limit: 1,
        });

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid API key - unauthorized');
        }
        if (!response.ok) throw new Error('Failed to fetch customer');

        const data = await response.json();
        return data.docs[0] || null;
    }

    async createCustomer(customerData: Omit<ICustomer, 'id'>): Promise<ICustomer> {
        // Хешируем пароль перед созданием
        const hashedPassword = await hash(customerData.password, 12);
        const customer = {
            ...customerData,
            password: hashedPassword,
        };

        console.log(customer);
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS);
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(customer),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create customer');
        }

        const data = await response.json();
        return data.doc || data;
    }

    async getCustomerById(id: string): Promise<ICustomer> {
        const url = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS)}/${id}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Failed to fetch customer');

        const data = await response.json();
        const customer = data.doc || data;

        // Убираем пароль из ответа
        const { password: _, ...customerWithoutPassword } = customer;

        return customerWithoutPassword;
    }

    async updateCustomer(id: string, updates: Partial<ICustomer>): Promise<ICustomer> {
        // Если обновляется пароль, хешируем его
        if (updates.password) {
            updates.password = await hash(updates.password, 12);
        }

        const url = `${ApiUrlBuilder.forCollection(COLLECTION_SLUGS.CUSTOMERS)}/${id}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update customer');
        }

        const data = await response.json();
        const customer = data.doc || data;

        // Убираем пароль из ответа
        const { password: _, ...customerWithoutPassword } = customer;

        return customerWithoutPassword;
    }

    // Проверка существования пользователя по emai
    async checkUserExists(email: string): Promise<boolean> {
        const customer = await this.findCustomerByEmail(email);
        return !!customer;
    }

    // Клиентский метод регистрации
    async register(userData: Omit<ICustomer, 'id'>): Promise<IAuthResult> {
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
    async updateProfile(updates: Partial<ICustomer>): Promise<IAuthResult> {
        const res = await fetch(`${ApiUrlBuilder.forProfileUpdate()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        const data = await res.json();

        if (!res.ok) {
            return { success: false, error: data.message || 'Ошибка обновления профиля' };
        }

        return { success: true, user: data.customer };
    }
}

export const authService = new AuthService();
