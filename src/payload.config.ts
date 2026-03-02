import { postgresAdapter } from '@payloadcms/db-postgres';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { en } from '@payloadcms/translations/languages/en';
import { ru } from '@payloadcms/translations/languages/ru';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { AuthorsCollection } from '@/collections/authors.collection';
import { CartsCollection } from '@/collections/carts.collection';
import { CustomersCollection } from '@/collections/customers.collection';
import { FormsCollection } from '@/collections/forms.collection';
import { MediaCollection } from '@/collections/media.collection';
import { OrdersCollection } from '@/collections/orders.collection';
import { ProductsCollection } from '@/collections/products.collection';
import { UsersCollection } from '@/collections/users.collection';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';

import { cleanupUnverifiedUsers } from './jobs/cleanupUnverifiedUsers';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
    serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    secret: process.env.PAYLOAD_SECRET || 'dev-secret',
    admin: {
        user: COLLECTION_SLUGS.USERS,
    },
    editor: lexicalEditor(),
    collections: [
        ProductsCollection,
        AuthorsCollection,
        UsersCollection,
        FormsCollection,
        CartsCollection,
        CustomersCollection,
        OrdersCollection,
        MediaCollection,
    ],

    i18n: {
        fallbackLanguage: 'ru',
        supportedLanguages: { en, ru },
    },
    localization: {
        locales: [
            {
                label: 'Русский',
                code: 'ru',
            },
            {
                label: 'English',
                code: 'en',
            },
        ],
        defaultLocale: 'ru',
        fallback: true,
    },

    email: nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM || 'no-reply@polki-minto.ru',
        defaultFromName: 'MINTO',
        transportOptions: {
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
        },
    }),

    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL,
        },
    }),
    typescript: {
        outputFile: path.resolve(dirname, 'shared/types/payload-types.ts'),
    },
    cors: [process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'].filter(Boolean),
    csrf: [process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'].filter(Boolean),

    jobs: {
        addParentToTaskLog: true,
        tasks: [cleanupUnverifiedUsers],
        autoRun: [
            {
                cron: '* * * * *', // каждую минуту
                queue: 'cleanup',
                limit: 5,
            },
        ],
    },
});
