import type { CollectionConfig } from 'payload';

import type { Form } from '@/shared/types/payload-types';
import { sendEmail } from '@/shared/utils/email';
import { isAdmin, isCreateOperation } from '@/shared/utils/payload';

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
                if (isCreateOperation(operation)) {
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
