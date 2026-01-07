import { nanoid } from 'nanoid';
import { type CollectionConfig } from 'payload';
import slugify from 'slugify';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { PRODUCT_CATEGORIES } from '@/shared/constants/products.constants';
import { isAdmin, isAuthor, isCreateOperation, isCustomer } from '@/shared/utils/payload';

export const ProductsCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.PRODUCTS,
    labels: { singular: 'Product', plural: 'Products' },
    admin: { useAsTitle: 'title' },

    access: {
        read: async ({ req: { user, payload } }) => {
            // Публичный доступ для фронтенда (анонимные запросы)
            if (!user) return true;

            // Админы видят все товары
            if (isAdmin(user)) return true;

            // Покупатели видят все товары
            if (isCustomer(user)) return true;

            // Авторы видят только свои товары
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

        update: async ({ req: { user, payload }, id }) => {
            // Публичный доступ для фронтенда закрыт (анонимные запросы)
            if (!user) return false;

            // Админы могут обновлять любые товары
            if (isAdmin(user)) return true;

            // Авторы могут обновлять только свои товары
            if (isAuthor(user)) {
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const author = authorRes.docs[0];
                if (!author) return false;

                if (!id) return false;

                try {
                    // Получаем товар
                    const product = await payload.findByID({
                        collection: COLLECTION_SLUGS.PRODUCTS,
                        id: id,
                    });

                    if (!product) return false; // На всякий случай

                    // Сравниваем ID автора товара с ID автора
                    // product.author может быть объектом или ID
                    // ^ TODO: странно это, пофиксить мб

                    const productAuthorId = typeof product.author === 'object' ? product.author.id : product.author;
                    const hasAccess = productAuthorId === author.id;

                    return hasAccess;
                } catch (error) {
                    // Если товар не найден (findByID выбросил ошибку),
                    // значит и обновлять нечего => запрещаем доступ
                    console.error('Error: product not found', error);
                    return false;
                }
            }

            return false;
        },

        // create и delete аналогичны update
        create: async ({ req: { user, payload } }) => {
            if (!user) return false;

            if (isAdmin(user)) return true;

            if (isAuthor(user)) {
                // Проверяем, что у автора есть профиль
                // const payload = await getPayload({ config });
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                return authorRes.docs.length > 0;
            }

            return false;
        },

        delete: async ({ req: { user, payload }, id }) => {
            if (!user) return false;

            if (isAdmin(user)) return true;

            if (isAuthor(user)) {
                // const payload = await getPayload({ config });
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const author = authorRes.docs[0];
                if (!author) return false;

                if (!id) return false;

                try {
                    const product = await payload.findByID({
                        collection: COLLECTION_SLUGS.PRODUCTS,
                        id: id,
                    });

                    if (!product) return false;

                    const productAuthorId = typeof product.author === 'object' ? product.author.id : product.author;
                    return productAuthorId === author.id;
                } catch (error) {
                    console.error('Error: product not found', error);
                    return false;
                }
            }

            return false;
        },
    },

    fields: [
        { name: 'title', type: 'text', required: true },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        { name: 'price', type: 'number', required: true },
        { name: 'description', type: 'textarea' },
        // { name: 'image', type: 'text' }, // TODO: relationTo: 'media'
        // {
        //     name: 'image',
        //     type: 'upload',
        //     relationTo: COLLECTION_SLUGS.MEDIA as CollectionSlug,
        // },

        {
            name: 'gallery',
            type: 'array',
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: COLLECTION_SLUGS.MEDIA,
                },
            ],
        },

        //{ name: 'quantity', type: 'number' },
        {
            name: 'category',
            type: 'select',
            options: [...PRODUCT_CATEGORIES.map(({ value, label }) => ({ value, label }))],
            required: false,
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.AUTHORS,
            required: true,
            // Текущий автор не может добавить товар другому автору
            access: {
                create: ({ req }) => isAdmin(req.user),
                update: ({ req }) => isAdmin(req.user),
            },
            admin: {
                position: 'sidebar',
            },
        },
    ],
    hooks: {
        beforeChange: [
            async ({ data, req, operation }) => {
                const { user, payload } = req;
                if (isCreateOperation(operation) && isAuthor(user)) {
                    const authorRes = await payload.find({
                        collection: COLLECTION_SLUGS.AUTHORS,
                        where: { user: { equals: user!.id } },
                        limit: 1,
                    });

                    const author = authorRes.docs[0];
                    if (author) {
                        data.author = author.id; // автор автоматически устанавливается
                    }
                }

                return data;
            },

            // Генерируем уникальный slug
            async ({ data, originalDoc, req }) => {
                const { payload } = req;

                // Генерируем slug только если slug отсутствует или title изменился
                if (!data.slug || (data.title && data.title !== originalDoc?.title)) {
                    const baseSlug = slugify(data.title, {
                        lower: true,
                        strict: true,
                        locale: 'ru',
                    });
                    let slug = `${baseSlug}-${nanoid(6)}`;

                    // Проверяем уникальность slug (маловероятно, на всякий случай)
                    let counter = 1;
                    while (
                        await payload
                            .count({
                                collection: COLLECTION_SLUGS.PRODUCTS,
                                where: { slug: { equals: slug } },
                            })
                            .then((res) => res.totalDocs > 0)
                    ) {
                        slug = `${baseSlug}-${nanoid(6)}-${counter++}`;
                    }

                    data.slug = slug;
                }
                return data;
            },
        ],
    },
};
