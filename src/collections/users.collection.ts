import { COLLECTION_SLUGS } from '@/services/api/api-url-builder';
import type { CollectionConfig } from 'payload';

// Коллекция пользователей панели администратора, управляемая через PayloadCMS
export const UsersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.USERS,
    auth: {
        // Поддержка API-ключей. Изменение данных о пользователе возможна только от лица главного админа (через его API key)
        // Получаем его ключ в админке и храним в PAYLOAD_API_KEY
        useAPIKey: true,
    },
    labels: { singular: 'User', plural: 'Users' },
    admin: { useAsTitle: 'email' },

    fields: [
        { name: 'email', type: 'email', required: true, unique: true },
        {
            name: 'role',
            type: 'text',
            required: true,
            defaultValue: 'author', // Создать ещё одного админа может только главный админ (первый созданный юзер) из админки
            admin: { hidden: true },
        },
    ],

    access: {
        // Блокируем авторам доступ к юзерам, разрешаем только смотреть свой профиль
        read: ({ req: { user }, id }) => {
            if (!user) return false;
            if (user.role === 'admin') return true;
            return user.id === id;
        },

        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
        delete: ({ req: { user } }) => user?.role === 'admin',
    },

    hooks: {
        beforeChange: [
            // Если создаём первого юзера, делаем его админом
            async ({ data, req }) => {
                const { payload } = req;

                const existingUsers = await payload.find({
                    collection: COLLECTION_SLUGS.USERS,
                    limit: 1,
                });

                if (existingUsers.totalDocs === 0) {
                    data.role = 'admin';
                }

                return data;
            },
        ],
    },
};
