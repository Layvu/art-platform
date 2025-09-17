import { PAGES } from '@/config/public-pages.config';

export interface IMenuItem {
    href: string;
    name: string;
}

export const MENU = [
    {
        href: PAGES.HOME,
        name: 'Главная',
    },
    {
        href: PAGES.ABOUT,
        name: 'О нас',
    },
    {
        href: PAGES.PRODUCTS,
        name: 'Арт-товары',
    },
    {
        href: PAGES.AUTHORS,
        name: 'Авторы',
    },
];
