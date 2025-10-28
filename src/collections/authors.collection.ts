import { COLLECTION_SLUGS } from '@/services/api/api-url-builder';
import { nanoid } from 'nanoid';
import { type CollectionConfig } from 'payload';
import slugify from 'slugify';

// TODO: вынести хуки в переменную / файл

export const AuthorsCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.AUTHORS,
    labels: { singular: 'Author', plural: 'Authors' },
    admin: { useAsTitle: 'name' },

    access: {
        read: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда (анонимные запросы)
            if (!user) return true;

            // Админы видят всех авторов
            if (user.role === 'admin') return true;

            // Авторы не видят других авторов
            return false;
        },
    },

    fields: [
        { name: 'name', type: 'text', required: true },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        { name: 'bio', type: 'textarea' },
        { name: 'avatar', type: 'text' }, // TODO: relationTo: 'media'
        {
            name: 'products_count',
            type: 'number',
            defaultValue: 0,
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
            access: { create: () => false, update: () => false },
            fields: [{ name: 'category', type: 'text' }],
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.USERS,
            required: false,
            unique: true,
            admin: { position: 'sidebar' },
        },
    ],
    hooks: {
        beforeChange: [
            // TODO: вынести, такой же у products.collection.ts
            // Генерируем уникальный slug
            async ({ data, originalDoc, req }) => {
                const { payload } = req;

                // Генерируем slug только если slug отсутствует или name изменился
                if (!data.slug || (data.name && data.name !== originalDoc?.name)) {
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
                }
                return data;
            },
        ],
    },
};
