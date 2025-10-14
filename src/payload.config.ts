import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { en } from '@payloadcms/translations/languages/en';
import { ru } from '@payloadcms/translations/languages/ru';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

// import { AuthorsCollection } from '@/collections/authors.collection';
// import { FormsCollection } from '@/collections/forms.collection';
// import { ProductsCollection } from '@/collections/products.collection';
// import { UsersCollection } from '@/collections/users.collection';
import { AuthorsCollection } from './collections/authors.collection'
import { FormsCollection } from './collections/forms.collection'
import { ProductsCollection } from './collections/products.collection'
import { UsersCollection } from './collections/users.collection'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    secret: process.env.PAYLOAD_SECRET || 'dev-secret',
    admin: {
        user: 'users',
    },
    editor: lexicalEditor(),
    collections: [ProductsCollection, AuthorsCollection, UsersCollection, FormsCollection],
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
        outputFile: path.resolve(dirname, 'payload-types.ts'),
        //outputFile: 'src/types/payload-types.ts', // TODO: не генерится(
    },
    cors: ['http://localhost:3000'],
});
