'use client';

import React from 'react';

import { ShoppingBasket } from 'lucide-react';
import Link from 'next/link';

import { useCartStore } from '@/services/store/cart/store';

import { Badge } from '../ui/badge';

import type { IMenuItemProps } from './MenuItem';

export default function CartButton({ menuItem, isActive }: IMenuItemProps) {
    const { cart } = useCartStore();
    const itemsCount = cart?.items?.length ?? 0;

    return (
        <Link
            href={menuItem.href}
        >
            <div className="p-2 relative w-fit cursor-pointer">
                <ShoppingBasket size={24} className={`${isActive ? 'text-orange-400' : 'text-zinc-900'}`} />

                {itemsCount > 0 && (
                    <Badge
                        variant={'counter'}
                        className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 p-0 text-[12px] rounded-full hover:none"
                    >
                        {itemsCount}
                    </Badge>
                )}
            </div>
        </Link>
    );
}
