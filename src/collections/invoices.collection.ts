import { type CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isProductData } from '@/shared/guards/product.guard';
import { INVOICE_ITEM_CONDITION } from '@/shared/types/invoice.interface';
import { isAdmin, isAuthor, isUpdateOperation } from '@/shared/utils/payload';

export const InvoicesCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.INVOICES,
    labels: { singular: 'Накладная', plural: 'Накладные' },
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['id', 'author', 'isConfirmed', 'createdAt'],
    },

    access: {
        read: async ({ req: { user, payload } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            // TODO: вынести метод и переиспользовать - является ли автором и владельцем - isAuthorOwner(user, payload)
            if (isAuthor(user)) {
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const author = authorRes.docs[0];
                if (!author) return false;
                return { author: { equals: author.id } };
            }
            return false;
        },
        create: ({ req: { user } }) => isAdmin(user) || isAuthor(user),
        update: ({ req: { user } }) => isAdmin(user) || isAuthor(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },

    fields: [
        {
            name: 'isConfirmed',
            type: 'checkbox',
            label: 'Подтвердить получение товаров',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'При установке галочки цена и количество товаров будут отображены на сайте',
            },
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.AUTHORS,
            required: true,
            label: 'Автор',
        },
        {
            name: 'items',
            type: 'array',
            label: 'Товары',
            labels: {
                singular: 'Товар',
                plural: 'Товары',
            },
            required: true,
            fields: [
                {
                    name: 'orderNumber',
                    type: 'number',
                    label: '№ п.п.',
                    required: true,
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'product',
                    type: 'relationship',
                    relationTo: COLLECTION_SLUGS.PRODUCTS,
                    required: true,
                    label: 'Товар',
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'quantity',
                    type: 'number',
                    label: 'Количество',
                    required: true,
                    min: 1,
                },
                {
                    name: 'price',
                    type: 'number',
                    label: 'Цена',
                    required: true,
                },
                {
                    name: 'condition',
                    type: 'select',
                    label: 'Состояние',
                    required: true,
                    defaultValue: INVOICE_ITEM_CONDITION.NEW,
                    options: [
                        { label: 'Новый', value: INVOICE_ITEM_CONDITION.NEW },
                        { label: 'Старый', value: INVOICE_ITEM_CONDITION.OLD },
                        { label: 'Переоценка', value: INVOICE_ITEM_CONDITION.REVALUATION },
                    ],
                },
            ],
        },
    ],

    hooks: {
        afterChange: [
            async ({ doc, previousDoc, req, operation }) => {
                // Обработка синхронизации данных товаров и накладной после нажатия isConfirmed
                if (isUpdateOperation(operation) && doc.isConfirmed && !previousDoc.isConfirmed) {
                    for (const item of doc.items) {
                        const productId = isProductData(item.product) ? item.product.id : item.product;

                        try {
                            const product = await req.payload.findByID({
                                collection: COLLECTION_SLUGS.PRODUCTS,
                                id: productId,
                                req,
                            });

                            let newQuantity = product.quantity || 0;
                            if (item.condition !== INVOICE_ITEM_CONDITION.REVALUATION) {
                                newQuantity += item.quantity || 0;
                            }

                            await req.payload.update({
                                collection: COLLECTION_SLUGS.PRODUCTS,
                                id: productId,
                                data: {
                                    price: item.price,
                                    quantity: newQuantity,
                                },
                                req,
                            });
                        } catch (error) {
                            console.error(`Ошибка синхронизации товара ${productId}:`, error);
                        }
                    }
                }
                return doc;
            },
        ],
    },
};
