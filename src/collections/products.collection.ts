import { nanoid } from 'nanoid';
import { type CollectionConfig, getPayload } from 'payload';
import slugify from 'slugify';

import config from '@/payload.config';
import { PRODUCT_CATEGORIES } from '@/shared/constants/products.constants';

// TODO: enum 'admin', 'author'

export const ProductsCollection: CollectionConfig = {
    slug: 'products',
    labels: { singular: 'Product', plural: 'Products' },
    admin: { useAsTitle: 'title' },

    access: {
        read: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда (анонимные запросы)
            if (!user) return true;

            // Админы видят все товары
            if (user.role === 'admin') return true;

            // Авторы видят только свои товары
            const payload = await getPayload({ config });
            const authorRes = await payload.find({
                collection: 'authors',
                where: { user: { equals: user.id } },
                limit: 1,
            });
            const author = authorRes.docs[0];
            if (!author) return false;

            return { author: { equals: author.id } };
        },
    },

    fields: [
        { name: 'title', type: 'text', required: true },
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
        { name: 'price', type: 'number', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'text' }, // TODO: relationTo: 'media'
        {
            name: 'category',
            type: 'select',
            options: [...PRODUCT_CATEGORIES.map(({ value, label }) => ({ value, label }))],
            required: false,
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'authors',
            required: true,
            // Текущий автор не может добавить товар другому автору
            access: {
                create: ({ req }) => req.user?.role === 'admin',
                update: ({ req }) => req.user?.role === 'admin',
            },
            admin: {
                position: 'sidebar',
            },
        },
    ],
    hooks: {
        beforeChange: [
            async ({ data, req, operation }) => {
                const { user, payload } = req;

                if (operation === 'create' && user?.role === 'author') {
                    const authorRes = await payload.find({
                        collection: 'authors',
                        where: { user: { equals: user.id } },
                        limit: 1,
                    });

                    const author = authorRes.docs[0];
                    if (author) {
                        data.author = author.id; // автор автоматически устанавливается
                    }
                }

                return data;
            },

            // TODO: вынести, такой же у authors.collection.ts
            // Генерируем уникальный slug
            async ({ data, originalDoc, req }) => {
                const { payload } = req;

                // Генерируем slug только если slug отсутствует или title изменился
                if (!data.slug || (data.title && data.title !== originalDoc?.title)) {
                    const baseSlug = slugify(data.title, {
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
                                collection: 'products',
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
