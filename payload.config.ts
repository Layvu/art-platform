import { buildConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { postgresAdapter } from '@payloadcms/db-postgres';

import { en } from '@payloadcms/translations/languages/en';
import { ru } from '@payloadcms/translations/languages/ru';

import { UsersCollection } from '@/collections/users.collection';
import { ProductsCollection } from '@/collections/products.collection';
import { AuthorsCollection } from '@/collections/authors.collection';

export default buildConfig({
    serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    secret: process.env.PAYLOAD_SECRET || 'dev-secret',
    admin: {
        user: 'users',
    },
    editor: lexicalEditor(),
    collections: [ProductsCollection, AuthorsCollection, UsersCollection],
    i18n: {
        fallbackLanguage: 'en',
        supportedLanguages: { en, ru },
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL,
        },
    }),
    typescript: {
        outputFile: 'src/types/payload-types.ts', // TODO: не генерится(
    },
    cors: ['http://localhost:3000'],
});
