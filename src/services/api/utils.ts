import type { IAuthor } from '@/shared/types/author.interface';
import type { PayloadAuthor } from '@/shared/types/payload-types';

export const mapPayloadAuthorToIAuthor = (author: PayloadAuthor): IAuthor => ({
    id: author.id,
    name: author.name,
    bio: author.bio,
    avatar: author.avatar,
    productsCount: author.products_count,
    productCategories: author.product_categories?.map((c) => c.category) || [],
});
