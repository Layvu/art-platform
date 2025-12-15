'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import CartItem from '@/components/cart/CartItem';
import { ItemGroup } from '@/components/ui/item';
import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isProductData } from '@/shared/guards/product.guard';
import { useProductsByIds } from '@/shared/hooks/useFetchData';
import type { ICartItem } from '@/shared/types/cart.interface';
import type { Product } from '@/shared/types/payload-types';

import { Button } from '../ui/button';

interface ICartUIProps {
    isUserAuthorized: boolean;
}

export default function CartUI({ isUserAuthorized }: ICartUIProps) {
    const router = useRouter();
    const { cart } = useCartStore();

    // берем текущие товары из корзины
    const items = cart?.items ?? [];

    // берем id товаров, парсим их в массив чисел
    const productsIds = items.map((item) => {
        if (isProductData(item.product)) return item.product.id;
        return item.product;
    });

    // фетчим товары по массиву чисел
    const { data: products, isLoading, isError } = useProductsByIds(productsIds);

    // лоадинг
    if (isLoading) return <>Loading from ui...</>;
    if (isError) return <>Error</>;
    if (!products) return <>No products found</>;

    // сливаем товары с корзиной
    // было product: number, cтало product: Product
    const itemsWithProducts = items
        .map((item) => {
            const product = products.find((p) => p.id === item.product);
            if (!product) return null;
            return { ...item, product };
        })
        .filter(Boolean) as (ICartItem & { product: Product })[];

    // выбранные товары
    const checkedItems = itemsWithProducts.filter((item) => item.checked);

    // итоговая цена
    const total = checkedItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    const handleCheckout = () => {
        if (isLoading) return;

        // Проверяем авторизацию через Payload CMS

        if (isUserAuthorized) {
            // Если авторизован, перенаправляем на order
            router.push(PAGES.ORDER);
        } else {
            // Если не авторизован, перенаправляем на login с редиректом на order
            router.push(`${PAGES.LOGIN}?redirect=${PAGES.ORDER}`);
        }
    };

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-bold">Корзина</h1>

            {itemsWithProducts.length === 0 && <p>Корзина пуста</p>}

            <ItemGroup className="flex w-full max-w-md flex-col gap-6">
                {itemsWithProducts.map((item) => (
                    <CartItem key={item.id ?? item.product.id} item={item} />
                ))}
            </ItemGroup>

            {checkedItems.length > 0 && (
                <div className="mt-6 p-4 border rounded-lg max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Итого к оплате:</span>
                        <span className="text-xl font-bold">{total} руб.</span>
                    </div>

                    <Button onClick={handleCheckout} className="w-full" size="lg">
                        Оформить заказ
                    </Button>
                </div>
            )}
        </div>
    );
}
