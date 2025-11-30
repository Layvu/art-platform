'use client';

import React from 'react';

import CartItem from '@/components/cart/CartItem';
import { ItemGroup } from '@/components/ui/item';
import { useCartStore } from '@/services/store/cart/store';
import { isProductData } from '@/shared/guards/product.guard';
import { useProductsByIds } from '@/shared/hooks/useFetchData';
import type { ICartItem } from '@/shared/types/cart.interface';
import type { Product } from '@/shared/types/payload-types';

export default function CartUI() {
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

    // итоговая цена
    const total = itemsWithProducts
        .filter((i) => i.checked)
        .reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    return (
        <div className="p-4">
            <h1 className="mb-4">Cart</h1>

            {itemsWithProducts.length === 0 && <p>Cart is empty</p>}

            <ItemGroup className="flex w-full max-w-md flex-col gap-6">
                {itemsWithProducts.map((item) => (
                    <CartItem key={item.id ?? item.product.id} item={item} />
                ))}
            </ItemGroup>

            <div className="mt-4">TOTAL AMOUNT: {total}</div>
        </div>
    );
}
