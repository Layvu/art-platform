import type { User } from '@/shared/types/payload-types';

// TODO: очень много где можно заменить на ApiUrlBuilder

export class PayloadClientAuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // TODO
    }

    // Выход (для Client Components)
    async logout(): Promise<void> {
        await fetch(`${this.baseUrl}/api/users/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    }

    // Получение текущего пользователя (для Client Components)
    async getCurrentUser(): Promise<User | null> {
        const response = await fetch(`${this.baseUrl}/api/users/me`, {
            credentials: 'include',
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                return null;
            }
        }

        const responseData = await response.json();
        return responseData.user || null;
    }
}

export const payloadClientAuthService = new PayloadClientAuthService();
