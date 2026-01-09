import { nanoid } from 'nanoid';
import { type CollectionConfig } from 'payload';
import slugify from 'slugify';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isAuthor } from '@/shared/utils/payload';

// TODO: вынести хуки коллекций в переменную / файл

export const AuthorsCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.AUTHORS,
    labels: { singular: 'Автор', plural: 'Авторы' },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'avatar', 'user', 'createdAt'],
    },

    access: {
        read: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда
            if (!user) return true;

            // Админы видят всех авторов
            if (isAdmin(user)) return true;

            // Авторы видят только свою запись
            if (isAuthor(user)) {
                return {
                    user: { equals: user.id },
                };
            }

            // Все остальные видят авторов
            return true;
        },

        update: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда закрыт (анонимные запросы)
            if (!user) return false;

            // Админы могут обновлять любых авторов
            if (isAdmin(user)) return true;

            if (isAuthor(user)) {
                // Автор может обновлять только свою запись
                return {
                    user: { equals: user.id },
                };
            }

            return false;
        },

        create: ({ req: { user } }) => isAdmin(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },

    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Имя',
        },
        {
            name: 'slug',
            type: 'text',
            label: 'Уникальная часть URL',
            unique: true,
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        {
            name: 'bio',
            type: 'textarea',
            label: 'Описание профиля',
        },
        {
            name: 'avatar',
            type: 'upload',
            relationTo: COLLECTION_SLUGS.MEDIA,
        },
        {
            name: 'products_count',
            type: 'number',
            defaultValue: 0,
            label: 'Общее количество товаров',
            admin: { readOnly: true },
            access: {
                create: () => false,
                update: () => false,
            },
        },
        {
            name: 'product_categories',
            type: 'array',
            admin: { readOnly: true },
            label: 'Категории продаваемых товаров',
            access: {
                create: () => false,
                update: () => false,
            },
            fields: [{ name: 'category', type: 'text' }],
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.USERS,
            required: false,
            unique: true,
            label: 'Связанная учётная запись',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания профиля',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'updatedAt',
            type: 'date',
            label: 'Дата последнего обновления данных профиля',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
    ],
    hooks: {
        beforeChange: [
            // Генерируем уникальный slug
            async ({ data, originalDoc, req }) => {
                const { payload } = req;

                // Генерируем slug только если передан name И если slug отсутствует или name изменился
                if (data.name && (!data.slug || data.name !== originalDoc?.name)) {
                    const baseSlug = slugify(data.name, {
                        lower: true,
                        strict: true,
                        locale: 'ru',
                    });
                    let slug = `${baseSlug}-${nanoid(6)}`;

                    // Проверяем уникальность slug (маловероятно, на всякий случай)
                    let counter = 1;
                    while (
                        await payload
                            .count({
                                collection: COLLECTION_SLUGS.AUTHORS,
                                where: { slug: { equals: slug } },
                            })
                            .then((res) => res.totalDocs > 0)
                    ) {
                        slug = `${baseSlug}-${nanoid(6)}-${counter++}`;
                    }

                    data.slug = slug;
                } else {
                    // Если name нет, генерируем slug на основе Id пользователя
                    data.slug = `author-${nanoid(6)}`;
                }

                return data;
            },
        ],
    },
};
