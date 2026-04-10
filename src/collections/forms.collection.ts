import type { CollectionConfig } from 'payload';

import type { Form } from '@/shared/types/payload-types';
import { sendEmail } from '@/shared/utils/email';
import { isAdmin, isCreateOperation } from '@/shared/utils/payload';

export const FormsCollection: CollectionConfig = {
    slug: 'forms',
    labels: { singular: 'Анкета', plural: 'Анкеты' },
    admin: {
        useAsTitle: 'nickname',
        defaultColumns: ['nickname'],
    },

    access: {
        read: ({ req: { user } }) => isAdmin(user),
        create: ({ req: { user } }) => isAdmin(user),
        update: ({ req: { user } }) => isAdmin(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },

    fields: [
        {
            name: 'email',
            type: 'email',
            required: true,
        },
        {
            name: 'vkPersonal',
            type: 'text',
            required: true,
        },
        {
            name: 'activities',
            type: 'json',
            required: true,
        },
        {
            name: 'otherActivity',
            type: 'text',
        },
        {
            name: 'publicLink',
            type: 'text',
            required: true,
        },
        {
            name: 'nickname',
            type: 'text',
            required: true,
        },
        {
            name: 'shelves',
            type: 'json',
            required: true,
        },
        {
            name: 'needRail',
            type: 'checkbox',
            required: true,
        },
        // TODO: добавить новые поля:
        // { name: 'name', type: 'text' },
        // { name: 'email', type: 'email', required: true },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата получения анкеты',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
    ],

    hooks: {
        afterChange: [
            async ({ operation, doc }) => {
                if (isCreateOperation(operation)) {
                    const formDoc = doc as Form;
                    await sendEmail({
                        to: process.env.EMAIL_TO || 'zemskyalexey.writer@mail.ru',
                        subject: 'Новая анкета автора',
                        text: `Получена анкета автора:\n\nСообщение: ${formDoc.nickname}`,
                    });
                }
            },
        ],
    },
};
