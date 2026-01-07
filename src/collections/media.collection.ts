// collections/Media.ts
import type { CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isAuthor } from '@/shared/utils/payload';

export const MediaCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.MEDIA,
    labels: { singular: 'Media', plural: 'Media' },

    upload: {
        mimeTypes: ['image/*'],
        imageSizes: [
            { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
            { name: 'medium', width: 800 },
        ],
        adminThumbnail: 'thumbnail',
    },

    admin: { useAsTitle: 'filename' },
    fields: [],

    access: {
        read: () => true,

        // Загружать, обновлять и удалять медиа-файлы могут только админы и авторы
        create: async ({ req: { user } }) => {
            if (!user) return false;

            if (isAdmin(user) || isAuthor(user)) return true;

            return false;
        },

        update: async ({ req: { user } }) => {
            if (!user) return false;

            if (isAdmin(user) || isAuthor(user)) return true;

            return false;
        },

        delete: async ({ req: { user } }) => {
            if (!user) return false;

            if (isAdmin(user) || isAuthor(user)) return true;

            return false;
        },
    },
};
