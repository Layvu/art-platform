'use client';

import React from 'react';

import { Minus, PlusIcon, Trash } from 'lucide-react';

import NotFound from '@/app/not-found';
import { Checkbox } from '@/components/ui/checkbox';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { useCartStore } from '@/services/store/cart/store';
import { isProductData } from '@/shared/guards/product.guard';
import { useFetchProductById } from '@/shared/hooks/useFetchData';
import type { ICartItem } from '@/shared/types/cart.interface';
import type { Cart, Product } from '@/shared/types/payload-types';

export default function CartItem({ item }: { item: ICartItem }) {
    const { toggleChecked, increase, decrease, removeItem } = useCartStore();

    const productId = typeof item.product === 'number' ? item.product : item.product.id;
    const product = item.product;
    if (!isProductData(product)) return null;
    return (
        <Item variant="outline">
            <ItemContent className="flex gap-2 flex-row items-center">
                <Checkbox
                    checked={item.checked || false}
                    onCheckedChange={() => toggleChecked(productId)}
                    className="mr-2"
                />
                <div className="flex flex-col">
                    <ItemTitle>{product.title}</ItemTitle>
                    <ItemDescription>{product.description}</ItemDescription>
                    <ItemDescription>Цена: {product.price}</ItemDescription>
                    <ItemDescription>{item.quantity} штук в корзине</ItemDescription>
                </div>
            </ItemContent>
            <ItemActions>
                <PlusIcon onClick={() => increase(productId)} cursor={'pointer'} />
                <Minus onClick={() => decrease(productId)} cursor={'pointer'} />
                <Trash onClick={() => removeItem(productId)} color="red" cursor={'pointer'} />
            </ItemActions>
            {/* <ItemSeparator /> */}
        </Item>
    );
}
