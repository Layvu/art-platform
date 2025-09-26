import type { IAuthor } from '@/shared/types/author.interface';
import type { IPayloadAuthor } from '@/shared/types/payload-types';

export const mapIPayloadAuthorToIAuthor = (author: IPayloadAuthor): IAuthor => ({
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio,
    avatar: author.avatar,
    productsCount: author.products_count,
    productCategories: author.product_categories?.map((c) => c.category) || [],
});
