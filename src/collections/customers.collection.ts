import type { CollectionConfig } from 'payload';

import { isAdmin } from '@/lib/utils/payload';
import { COLLECTION_SLUGS } from '@/services/api/api-url-builder';

// Коллекция покупателей, управляемая через next-auth
export const CustomersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.CUSTOMERS,
    labels: { singular: 'Customer', plural: 'Customers' },
    admin: {
        useAsTitle: 'fullName',
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
            // Хешированный пароль
            name: 'password',
            type: 'text',
            required: true,
            admin: { hidden: true },
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
            name: 'createdAt',
            type: 'date',
            label: 'Дата регистрации',
            admin: { readOnly: true },
        },
    ],

    access: {
        read: ({ req: { user }, data }) => {
            // Неавторизованные пользователи не видят список покупателей
            if (!user) return false;

            // Админы видят всех покупателей
            if (isAdmin(user)) return true;

            // Покупатели видят только свои данные
            if (data?.id === user?.id) return true;

            // Все остальные не видят список покупателей
            return false;
        },

        // Регистрация должна идти от лица главного админа
        create: ({ req: { user } }) => isAdmin(user),

        // Покупатели могут обновлять только свои данные, админы могут обновлять любого
        // (это нужно для того, чтобы обновлять токена админа, по факту же для админа все поля пользователя readonly)
        update: ({ req: { user }, data }) => {
            if (!user) return false;
            return isAdmin(user) || data?.id === user?.id;
        },

        // Удалить профиль может только админ
        delete: ({ req: { user } }) => isAdmin(user),
    },
};
