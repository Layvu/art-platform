import { PAGES } from '@/config/public-pages.config';

export interface IMenuItem {
    href: string;
    name: string;
    requiresAuth?: boolean;
    guestOnly?: boolean;
}

export const MENU: IMenuItem[] = [
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
    {
        href: PAGES.CART,
        name: 'Корзина',
    },
    {
        href: PAGES.LOGIN,
        name: 'Вход',
        guestOnly: true,
    },
    {
        href: PAGES.REGISTER,
        name: 'Регистрация',
        guestOnly: true,
    },
    {
        href: PAGES.PROFILE,
        name: 'Личный кабинет',
        requiresAuth: true,
    },
    {
        href: '#',
        name: 'Выход',
        requiresAuth: true,
    },
];
