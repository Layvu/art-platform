import { type CollectionConfig } from 'payload';

import { isAdmin } from '@/lib/utils/payload';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { DELIVERY_TYPES, ORDER_STATUS } from '@/shared/constants/order.constants';

export const OrdersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.ORDERS,
    // TODO: Везде сменить на русский язык названия коллекций и полей в админке
    labels: { singular: 'Заказ', plural: 'Заказы' },
    admin: {
        useAsTitle: 'orderNumber',
        defaultColumns: ['orderNumber', 'customer', 'status', 'total', 'createdAt'],
    },

    fields: [
        {
            name: 'orderNumber',
            type: 'text',
            unique: true,
            label: 'Номер заказа',
            admin: {
                readOnly: true,
                position: 'sidebar',
            },
        },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CUSTOMERS,
            label: 'Покупатель',
            admin: { readOnly: true },
            required: true,
        },
        {
            name: 'items',
            type: 'array',
            label: 'Данные товаров на момент оформления заказа',
            labels: {
                singular: 'Товар',
                plural: 'Товары',
            },
            fields: [
                {
                    // Если сохранять не снэп, а id товара, то если товар изменится - история заказов покажет неверные данные
                    name: 'productSnapshot',
                    type: 'group',
                    label: 'Товар',
                    admin: { readOnly: true },
                    fields: [
                        {
                            name: 'productId',
                            type: 'number',
                            required: true,
                            admin: { readOnly: true, hidden: true },
                        },
                        {
                            name: 'title',
                            type: 'text',
                            required: true,
                            label: 'Название',
                            admin: { readOnly: true },
                        },
                        {
                            name: 'price',
                            type: 'number',
                            required: true,
                            label: 'Цена за штуку',
                            admin: { readOnly: true },
                        },
                    ],
                },
                {
                    name: 'quantity',
                    type: 'number',
                    min: 1,
                    label: 'Количество',
                    admin: { readOnly: true },
                    required: true,
                },
            ],
            admin: { readOnly: true },
            required: true,
        },
        {
            name: 'deliveryType',
            type: 'select',
            options: [
                { value: DELIVERY_TYPES.PICKUP, label: 'Самовывоз' },
                { value: DELIVERY_TYPES.DELIVERY, label: 'Доставка' },
            ],
            defaultValue: DELIVERY_TYPES.PICKUP,
            label: 'Выбранный способ доставки',
            admin: { readOnly: true },
            required: true,
        },
        {
            name: 'address',
            type: 'text',
            // Поле адреса обязательно только для доставки
            admin: {
                readOnly: true,
                condition: (data) => data.deliveryType === DELIVERY_TYPES.DELIVERY,
            },
        },
        {
            // Единственное редактируемое поле
            name: 'status',
            type: 'select',
            options: [
                { value: ORDER_STATUS.PROCESSING, label: 'В обработке' },
                { value: ORDER_STATUS.ASSEMBLED, label: 'Собран' },
                { value: ORDER_STATUS.SENT, label: 'Отправлен' },
                { value: ORDER_STATUS.DELIVERED, label: 'Доставлен' },
                { value: ORDER_STATUS.COMPLETED, label: 'Выполнен' },
                { value: ORDER_STATUS.CANCELLED, label: 'Отменён' },
            ],
            defaultValue: ORDER_STATUS.PROCESSING,
            label: 'Статус заказа',
        },
        {
            name: 'total',
            type: 'number',
            required: true,
            admin: { readOnly: true },
            label: 'Общая сумма заказа',
            min: 0,
        },
        // TODO: сделать формат даты понятным во всех коллекциях
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания заказа',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'updatedAt',
            type: 'date',
            label: 'Дата последнего обновления заказа',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
    ],

    access: {
        read: async ({ req: { user, payload } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;

            // Для покупателей находим их customer запись
            if (user.role === 'customer') {
                try {
                    const customerRes = await payload.find({
                        collection: COLLECTION_SLUGS.CUSTOMERS,
                        where: { user: { equals: user.id } },
                        limit: 1,
                    });

                    const customer = customerRes.docs[0];
                    if (!customer) return false;

                    // Возвращаем условие фильтрации по customer
                    return {
                        customer: { equals: customer.id },
                    };
                } catch (error) {
                    console.error('Error fetching customer for order access:', error);
                    return false;
                }
            }

            // Авторы не видят заказы
            return false;
        },

        create: ({ req }) => {
            // Разрешаем создавать заказы авторизованным покупателям
            return req.user?.role === 'customer';
        },

        update: async ({ req: { user, payload }, id }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            if (!id) return false;
            if (user.role === 'customer') {
                // 1. Находим customer запись пользователя
                const customerRes = await payload.find({
                    collection: COLLECTION_SLUGS.CUSTOMERS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const customer = customerRes.docs[0];
                if (!customer) return false;

                // 2. Получаем заказ
                const order = await payload.findByID({
                    collection: COLLECTION_SLUGS.ORDERS,
                    id: id,
                });
                if (!order) return false;

                // 3. Проверяем, что заказ принадлежит покупателю и в статусе PROCESSING
                const orderCustomerId = typeof order.customer === 'object' ? order.customer.id : order.customer;

                return orderCustomerId === customer.id && order.status === ORDER_STATUS.PROCESSING;
            }

            return false;
        },

        delete: ({ req }) => isAdmin(req.user),
    },

    hooks: {
        beforeValidate: [
            async ({ data, req, operation }) => {
                const { user, payload } = req;

                // TODO: operations const
                if (operation === 'create' && user && user.role === 'customer') {
                    // Находим customer запись для текущего пользователя
                    const customerRes = await payload.find({
                        collection: COLLECTION_SLUGS.CUSTOMERS,
                        where: { user: { equals: user.id } },
                        limit: 1,
                    });

                    const customer = customerRes.docs[0];
                    if (customer && !data?.customer) {
                        data!.customer = customer.id;
                    }

                    // Генерируем номер заказа
                    if (!data?.orderNumber && customer) {
                        const lastOrder = await payload.find({
                            collection: COLLECTION_SLUGS.ORDERS,
                            where: { customer: { equals: customer.id } },
                            limit: 1,
                        });

                        let orderSequence = 1;
                        if (lastOrder.docs.length > 0) {
                            const lastOrderNumber = lastOrder.docs[0]?.orderNumber;
                            const lastNumber = lastOrderNumber?.match(/-(\d+)$/);
                            if (lastNumber && lastNumber[1]) {
                                orderSequence = parseInt(lastNumber[1], 10) + 1;
                            }
                        }

                        data!.orderNumber = `ORD-${customer.id}-${orderSequence.toString().padStart(4, '0')}`;
                    }
                }

                return data;
            },
        ],
    },
};
