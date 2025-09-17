import type { CollectionConfig } from 'payload';

export const AuthorsCollection: CollectionConfig = {
    slug: 'authors',
    labels: { singular: 'Author', plural: 'Authors' },
    access: { read: () => true }, // публичный read
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'bio', type: 'textarea' },
        { name: 'avatar', type: 'text' }, // TODO: relationTo: 'media'
    ],
};
