'use client';

import Image from 'next/image';
import Link from 'next/link';

import { PAGES } from '@/config/public-pages.config';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';

import { useAuthStore } from '@/services/store/auth/store';

import { MENU } from '../Menu/menu.data';
import { MenuItem } from '../Menu/MenuItem';
import CartButton from '../Menu/CartButton';
import ProfileButton from '../Menu/ProfileButton';

export function Header() {
    const pathName = usePathname();
    // Получаем частичные данные текущего пользователя из localStorage
    const user = useAuthStore((state) => state.user);

    // Если пользователь авторизован (user существует), то отрисовываем Profile и Logout
    // Иначе отрисовываем Login и Register
    // const menuItems = MENU.filter((menuItem) => {
    //     if (user) {
    //         return !menuItem.guestOnly;
    //     } else {
    //         return !menuItem.requiresAuth;
    //     }
    // });
    const checkIsActive = (href: string) => {
        try {
            return !!match(href, { decode: decodeURIComponent })(pathName);
        } catch (error) {
            return pathName === href;
        }
    };
    return (
        <header className="flex items-center justify-between p-4 wrap">
            <Link href={PAGES.HOME} className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Minto Logo" width={80} height={40} priority />
            </Link>
            <nav className="flex gap-6">
                {MENU.map((menuItem) => (
                    <MenuItem key={menuItem.name} menuItem={menuItem} isActive={checkIsActive(menuItem.href)} />
                ))}
            </nav>
            <nav className="flex gap-4">
                <CartButton isActive={checkIsActive(PAGES.CART)} />
                <ProfileButton
                    isRegistered={!!user}
                    isActive={checkIsActive(PAGES.LOGIN) || checkIsActive(PAGES.PROFILE)}
                />
                <span style={{ fontSize: '6px' }}>v 1.0.5</span>
            </nav>
        </header>
    );
}
