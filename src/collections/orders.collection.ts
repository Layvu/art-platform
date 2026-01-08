import { type CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { DELIVERY_TYPES, ORDER_STATUS } from '@/shared/constants/order.constants';
import { UserType } from '@/shared/types/auth.interface';
import { isAdmin, isCreateOperation, isCustomer } from '@/shared/utils/payload';

export const OrdersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.ORDERS,
    labels: { singular: 'Заказ', plural: 'Заказы' },
    admin: {
        useAsTitle: 'orderNumber',
        defaultColumns: ['orderNumber', 'deliveryType', 'status', 'total', 'createdAt'],
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
            label: 'Адрес доставки',
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
            if (user.role === UserType.CUSTOMER) {
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

        create: async ({ req: { user } }) => {
            if (!user) return false;

            // Разрешаем создавать заказы админам и авторизованным покупателям (последнее это TODO)
            if (isAdmin(user) || isCustomer(user)) return true;

            return false;
        },

        update: async ({ req: { user, payload }, id }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            if (!id) return false;
            if (isCustomer(user)) {
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

                if (isCreateOperation(operation)) {
                    if (user && isCustomer(user)) {
                        // Находим customer запись для текущего пользователя
                        const customerRes = await payload.find({
                            collection: COLLECTION_SLUGS.CUSTOMERS,
                            where: { user: { equals: user.id } },
                            limit: 1,
                        });
                        const customer = customerRes.docs[0];
                        if (customer) {
                            data!.customer = customer.id;
                        }
                    }

                    // Генерируем номер заказа

                    if (data?.customer && !data?.orderNumber) {
                        // data.customer может быть ID (number) или объектом
                        const customerId = typeof data.customer === 'object' ? data.customer.id : data.customer;

                        const lastOrder = await payload.find({
                            collection: COLLECTION_SLUGS.ORDERS,
                            where: { customer: { equals: customerId } },
                            limit: 1,
                        });

                        let orderSequence = 1;
                        if (lastOrder.docs.length > 0) {
                            const lastOrderNumber = lastOrder.docs[0]?.orderNumber;
                            // Парсим "ORD-ID-0001"
                            const lastNumber = lastOrderNumber?.match(/-(\d+)$/);
                            if (lastNumber && lastNumber[1]) {
                                orderSequence = parseInt(lastNumber[1], 10) + 1;
                            }
                        }

                        data!.orderNumber = `ORD-${customerId}-${orderSequence.toString().padStart(4, '0')}`;
                    }
                }

                return data;
            },
        ],
    },
};
