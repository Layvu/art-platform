import { nanoid } from 'nanoid';
import type { CollectionConfig } from 'payload';
import slugify from 'slugify';

export const AuthorsCollection: CollectionConfig = {
    slug: 'authors',
    labels: { singular: 'Author', plural: 'Authors' },
    access: { read: () => true }, // публичный read
    fields: [
        { name: 'name', type: 'text', required: true },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
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
    ],
    hooks: {
        beforeChange: [
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
                                collection: 'authors',
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
