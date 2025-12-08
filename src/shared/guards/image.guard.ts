import type { Media } from '@/shared/types/payload-types';

export function isImageData(object: unknown): object is Media {
  return (
      typeof object === 'object' &&
      object !== null &&
      'id' in object &&
      'filename' in object
  );
}
