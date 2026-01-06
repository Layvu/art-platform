import { COLLECTION_SLUGS } from '@/shared/constants/constants';

// Базовый класс для серверных сервисов для переиспользования заголовков
export abstract class BaseServerService {
    protected readonly apiKey: string;

    constructor() {
        this.apiKey = process.env.PAYLOAD_API_KEY!;
        if (!this.apiKey) {
            console.warn('PAYLOAD_API_KEY is not set in env variables');
        }
    }

    protected getAuthHeaders() {
        // TODO: исправить эту логику, дав возможность юзерам в зависимости от их ролей читать и изменять данные:
        // Чтение и изменение данных в БД возможно только от лица главного админа. Логика проверки реализуема в access коллекциях
        return {
            'Content-Type': 'application/json',
            Authorization: `${COLLECTION_SLUGS.USERS} API-Key ${this.apiKey}`,
        };
    }
}
