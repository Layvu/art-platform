import type { CollectionConfig } from 'payload';

export const AuthorsCollection: CollectionConfig = {
    slug: 'authors',
    labels: { singular: 'Author', plural: 'Authors' },
    access: { read: () => true }, // публичный read
    fields: [
        { name: 'name', type: 'text', required: true },
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
};
