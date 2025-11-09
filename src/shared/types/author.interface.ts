import type { UserType } from './auth.interface';
import type { Author } from './payload-types';

export type IAuthorFormData = Partial<Omit<Author, 'id' | 'slug' | 'user' | 'createdAt' | 'updatedAt'>>;
export type IAuthorCreateInput = Omit<Author, 'id' | 'createdAt' | 'updatedAt'>;
export type IAuthorUpdateInput = Partial<IAuthorCreateInput>;
export type IAuthorWithoutPassword = Omit<Author, 'password'>;

// TODO: реализовать в UI
// Пригодится в UI автора:
export type IAuthorProductCategory = Exclude<Author['product_categories'], undefined | null>[number];

// Для сессии автора - минимум данных
export interface IAuthorSession {
    id: string; // User id
    authorId: number; // ID профиля в Authors
    type: UserType.AUTHOR;
}
