import { headers } from 'next/headers';

import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import type { ICredentials, UserRole } from '@/shared/types/auth.interface';
import type { User } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

import { BaseServerService } from './base-server.service';

export class AuthServerService extends BaseServerService {
    // Получение текущего пользователя (для Server Components)
    // Используем cookies из запроса
    async getCurrentUser(): Promise<User | null> {
        const headersList = await headers();
        const cookies = headersList.get('cookie') || '';

        const response = await fetch(apiUrl.auth.me(), {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
            },
            cache: 'no-store', // TODO ?
        });

        if (!response.ok) return null;

        const responseData = await response.json();
        return responseData.user || null;
    }

    async updateUserCredentials(userId: number, updates: ICredentials): Promise<void> {
        // Обновление email/password требует прав админа или самого пользователя
        // Пока что используем админский ключ
        const url = apiUrl.item(COLLECTION_SLUGS.USERS, userId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Failed to update credentials');
    }

    // Далее методы для работы с User сущностью
    async createUser(email: string, password: string, role: UserRole): Promise<User> {
        const url = apiUrl.collection(COLLECTION_SLUGS.USERS);

        const response = await fetch(url, {
            method: HTTP_METHODS.POST,
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ email, password, role }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }

        const data = await response.json();
        return data.doc;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const url = apiUrl.collection(COLLECTION_SLUGS.USERS, {
            where: { email: { equals: email } },
            limit: 1,
        });

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) return null;

        const data = await response.json();
        return data.docs[0] || null;
    }

    // Проверка существования пользователя по email
    async checkUserExists(email: string): Promise<boolean> {
        const user = await this.findUserByEmail(email);
        return !!user;
    }
}

export const authServerService = new AuthServerService();
