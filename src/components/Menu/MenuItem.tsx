import Link from 'next/link';

import type { IMenuItem } from './menu.data';

interface IProps {
    menuItem: IMenuItem;
    isActive: boolean;
}

export function MenuItem({ menuItem, isActive }: IProps) {
    return (
        <Link
            href={menuItem.href}
            className={`${isActive ? 'text-red' : 'text-white/80'} hover:underline`}
            onClick={menuItem.onClick}
        >
            {menuItem.name}
        </Link>
    );
}
