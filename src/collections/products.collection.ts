import { nanoid } from 'nanoid';
import type { CollectionConfig } from 'payload';
import slugify from 'slugify';

import { PRODUCT_CATEGORIES } from '@/app/(public)/products/constants';

export const ProductsCollection: CollectionConfig = {
    slug: 'products',
    labels: { singular: 'Product', plural: 'Products' },
    access: { read: () => true }, // публичный read
    fields: [
        { name: 'title', type: 'text', required: true },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
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
            relationTo: 'authors', // связь с коллекцией authors
            required: true,
        },
    ],
    hooks: {
        beforeChange: [
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
