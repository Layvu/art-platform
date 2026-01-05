import type { CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isCustomer } from '@/shared/utils/payload';

// Коллекция покупателей без данных для авторизации
export const CustomersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.CUSTOMERS,
    labels: { singular: 'Customer', plural: 'Customers' },
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['email', 'fullName', 'phone'],
    },

    fields: [
        {
            name: 'email',
            type: 'email',
            label: 'Электронная почта',
            required: true,
            unique: true,
            admin: { readOnly: true },
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.USERS,
            required: true,
            unique: true,
            admin: { readOnly: true },
        },
        {
            name: 'fullName',
            type: 'text',
            label: 'ФИО',
            admin: { readOnly: true },
        },
        {
            name: 'phone',
            type: 'text',
            label: 'Телефон',
            admin: { readOnly: true },
        },
        {
            name: 'addresses',
            type: 'array',
            label: 'Адреса покупателя',
            fields: [
                {
                    name: 'label',
                    type: 'text',
                    label: 'Название адреса',
                    admin: { readOnly: true },
                },
                {
                    name: 'addressLine',
                    type: 'text',
                    label: 'Улица, дом, квартира',
                    required: true,
                    admin: { readOnly: true },
                },
                {
                    name: 'city',
                    type: 'text',
                    label: 'Город',
                    required: true,
                    admin: { readOnly: true },
                },
                {
                    name: 'postalCode',
                    type: 'text',
                    label: 'Почтовый индекс',
                    required: true,
                    admin: { readOnly: true },
                },
            ],
            admin: { readOnly: true },
        },
        {
            name: 'cart',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CARTS,
            admin: { readOnly: true },
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата регистрации',
            admin: { readOnly: true },
        },
    ],

    access: {
        read: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда закрыт
            if (!user) return false;

            // Админы видят всех покупателей
            if (isAdmin(user)) return true;

            // Покупатели видят только свою запись
            if (isCustomer(user)) {
                return {
                    user: { equals: user.id },
                };
            }

            // Все остальные не видят покупателей
            return false;
        },

        update: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда закрыт (анонимные запросы)
            if (!user) return false;

            // Админы могут обновлять любых покупателей
            if (isAdmin(user)) return true;

            if (isCustomer(user)) {
                // Покупатель может обновлять только свою запись
                return {
                    user: { equals: user.id },
                };
            }

            return false;
        },

        // Создается автоматически через хук users
        create: ({ req: { user } }) => isAdmin(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },
};

// Users - только для авторизации
// Customers - дополнительные данные покупателей
// Authors - дополнительные данные авторов

// TODO: конвертировать все комментарии в коде в JSDoc
