'use client';

import React, { useMemo } from 'react';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import CartItem from '@/components/cart/CartItem';
import { Button } from '@/components/ui/button';
import { ItemGroup } from '@/components/ui/item';
import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isProductData } from '@/shared/guards/product.guard';
import { useProductsByIds } from '@/shared/hooks/useFetchData';
import type { ICartItem } from '@/shared/types/cart.interface';
import type { Product } from '@/shared/types/payload-types';
import { cn } from '@/shared/utils/tailwind';

import { Checkbox } from '../ui/checkbox';

interface ICartUIProps {
    isUserAuthorized: boolean;
}

export default function CartUI({ isUserAuthorized }: ICartUIProps) {
    const router = useRouter();
    const { cart, removeItem, toggleAll, clearCheckedItems } = useCartStore();

    const items = cart?.items ?? [];

    const productsIds = useMemo(() => {
        return items.map((item) => (isProductData(item.product) ? item.product.id : item.product));
    }, [items]);

    const { data: products, isLoading, isError, error, invalidIds } = useProductsByIds(productsIds);

    if (isLoading) return <div className="wrap mt-8 text-2xl font-semibold">Загрузка...</div>;

    if (isError && !error?.message.includes('404 Not Found')) {
        return <div className="wrap mt-8">Ошибка: {error?.message}</div>;
    }

    if (invalidIds && invalidIds.length > 0) {
        invalidIds.forEach((id) => removeItem(id));
    }

    const allItems = items
        .map((item) => {
            const productId = isProductData(item.product) ? item.product.id : item.product;
            const product = products?.find((p) => p.id === productId);
            if (!product) return null;
            return { ...item, product };
        })
        .filter(Boolean) as (ICartItem & { product: Product })[];

    if (allItems.length === 0) return <p className="wrap mt-8 text-xl font-semibold">Корзина пуста</p>;

    const availableItems = allItems.filter((item) => (item.product.quantity ?? 0) > 0);
    const unavailableItems = allItems.filter((item) => (item.product.quantity ?? 0) <= 0);

    const checkedItems = availableItems.filter((item) => item.checked);

    const isAllChecked = availableItems.length > 0 && availableItems.every((item) => item.checked);

    const total = checkedItems.reduce((sum, item) => sum + item.quantity * (item.product.price ?? 0), 0);

    const handleDeleteUnavailableItems = () => {
        unavailableItems.forEach((item) => removeItem(item.product.id));
    };
    const handleCheckout = () => {
        handleDeleteUnavailableItems();
        if (isUserAuthorized) {
            // удалить товары из корзины котырые недоступны
            router.push(PAGES.ORDER);
        } else {
            router.push(`${PAGES.LOGIN}?redirect=${PAGES.ORDER}`);
        }
    };
    return (
        <div className="wrap mt-8 mb-10 grid gap-6 grid-cols-12">
            <div className="flex flex-col col-span-8">
                <h1 className="text-[28px] font-semibold mb-8">Корзина</h1>

                {availableItems.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Доступны для заказа</h2>
                            <div className="flex gap-6">
                                <div
                                    className={cn(
                                        'flex gap-2 items-center cursor-pointer select-none transition-colors duration-200',
                                        isAllChecked ? 'text-my-accent' : 'text-my-primary',
                                    )}
                                    onClick={() => toggleAll(!isAllChecked)}
                                >
                                    <Checkbox checked={isAllChecked} onCheckedChange={() => {}} />
                                    <span className="font-medium">Выбрать все</span>
                                </div>
                                <Button
                                    className="font-semibold flex gap-2"
                                    variant={'pagination'}
                                    onClick={clearCheckedItems}
                                    disabled={checkedItems.length === 0}
                                >
                                    <Trash2 size={24} /> Удалить выбранные
                                </Button>
                            </div>
                        </div>

                        <ItemGroup className="flex flex-1 w-full flex-col gap-4">
                            {availableItems.map((item) => (
                                <CartItem key={item.id ?? item.product.id} item={item} available={true} />
                            ))}
                        </ItemGroup>
                    </>
                )}

                {unavailableItems.length > 0 && (
                    <section className="mt-8">
                        <div className="flex items-center justify-between mb-6 border-t pt-10">
                            <h2 className="text-xl font-semibold">Недоступны для заказа</h2>
                            <Button
                                variant="pagination"
                                className="font-semibold flex gap-2"
                                onClick={handleDeleteUnavailableItems}
                            >
                                <Trash2 size={24} /> Удалить все
                            </Button>
                        </div>
                        <ItemGroup className="flex flex-1 w-full flex-col gap-4 opacity-60">
                            {unavailableItems.map((item) => (
                                <CartItem key={item.product.id} item={item} available={false} />
                            ))}
                        </ItemGroup>
                    </section>
                )}

                {allItems.length === 0 && <p className="text-my-tertriary text-xl font-semibold">Корзина пуста</p>}
            </div>

            {checkedItems.length > 0 && (
                <div className="col-span-4 flex flex-col gap-4">
                    <div className="p-6 bg-gray-50 flex flex-col gap-6 h-fit w-full rounded-md">
                        <div className="flex justify-between items-center text-xl font-bold text-my-accent">
                            <span>Итого</span>
                            <span>{total.toLocaleString()} ₽</span>
                        </div>
                        <Button
                            onClick={handleCheckout}
                            className="w-full py-6 text-lg font-bold"
                            disabled={checkedItems.length === 0}
                            variant={'default'}
                        >
                            Перейти к оформлению
                        </Button>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-md flex flex-col gap-6 h-fit w-full">
                        <h3 className="text-xl font-bold">Состав заказа</h3>
                        <div className="space-y-4">
                            {checkedItems.map((item) => (
                                <div key={item.product.id} className="flex justify-between ">
                                    <span className="line-clamp-1 flex-1 pr-4">
                                        {item.product.title} ({item.quantity})
                                    </span>
                                    <span className="font-bold whitespace-nowrap">
                                        {(item.quantity * (item.product.price ?? 0)).toLocaleString()} ₽
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
