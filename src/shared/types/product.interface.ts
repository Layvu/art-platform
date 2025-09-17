import type { IAuthor } from './author.interface';

export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    author: IAuthor;
    image?: string;
}
