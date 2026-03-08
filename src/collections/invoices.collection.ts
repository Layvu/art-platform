import { type CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isAuthor } from '@/shared/utils/payload';

export const InvoicesCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.INVOICES,
    labels: { singular: 'Накладная', plural: 'Накладные' },
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['id', 'author', 'createdAt'],
    },

    access: {
        read: async ({ req: { user, payload } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            // TODO: вынести метод и переиспользовать - является ли автором и владельцем - isAuthorOwner(user, payload)
            if (isAuthor(user)) {
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const author = authorRes.docs[0];
                if (!author) return false;
                return { author: { equals: author.id } };
            }
            return false;
        },
        create: ({ req: { user } }) => isAdmin(user) || isAuthor(user),
        update: ({ req: { user } }) => isAdmin(user) || isAuthor(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },

    fields: [
        {
            name: 'author',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.AUTHORS,
            required: true,
            label: 'Автор',
        },
        {
            name: 'items',
            type: 'array',
            label: 'Товары',
            labels: {
                singular: 'Товар',
                plural: 'Товары',
            },
            required: true,
            fields: [
                {
                    name: 'orderNumber',
                    type: 'number',
                    label: '№ п.п.',
                    required: true,
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'product',
                    type: 'relationship',
                    relationTo: COLLECTION_SLUGS.PRODUCTS,
                    required: true,
                    label: 'Товар',
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'quantity',
                    type: 'number',
                    label: 'Количество',
                    required: true,
                    min: 1,
                },
                {
                    name: 'condition',
                    type: 'select',
                    label: 'Состояние',
                    required: true,
                    defaultValue: 'Н',
                    options: [
                        { label: 'Новый', value: 'Н' },
                        { label: 'Старый', value: 'С' },
                        { label: 'Переоценка', value: 'П' },
                    ],
                },
            ],
        },
    ],
};
