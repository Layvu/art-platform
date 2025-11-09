import type { CollectionConfig } from 'payload';

import { sendEmail } from '@/lib/utils/email';
import { isAdmin } from '@/lib/utils/payload';
import type { Form } from '@/shared/types/payload-types';

export const FormsCollection: CollectionConfig = {
    slug: 'forms',
    labels: { singular: 'Form', plural: 'Forms' },

    access: {
        read: ({ req: { user } }) => isAdmin(user),
        create: ({ req: { user } }) => isAdmin(user),
        update: ({ req: { user } }) => isAdmin(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },

    fields: [
        {
            name: 'content',
            type: 'textarea',
            required: true,
        },
        // TODO: добавить новые поля:
        // { name: 'name', type: 'text' },
        // { name: 'email', type: 'email', required: true },
    ],

    hooks: {
        afterChange: [
            async ({ operation, doc }) => {
                if (operation === 'create') {
                    const formDoc = doc as Form;
                    await sendEmail({
                        to: process.env.EMAIL_TO || 'zemskyalexey.writer@mail.ru',
                        subject: 'Новая анкета автора',
                        text: `Получена анкета автора:\n\nСообщение: ${formDoc.content}`,
                    });
                }
            },
        ],
    },
};
