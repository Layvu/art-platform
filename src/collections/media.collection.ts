// collections/Media.ts
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { CollectionConfig } from 'payload';


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

  access: { read: () => true },
};

