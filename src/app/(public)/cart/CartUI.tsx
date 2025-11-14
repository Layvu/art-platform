'use client';

import { useCartStore } from '@/services/store/cart/store';
import React from 'react';
import { isProductData } from '@/shared/guards/product.guard';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from '@/components/ui/item';
import { Minus, PlusIcon, Trash } from 'lucide-react';

export default function CartUI() {
    const { cart, toggleChecked, increase, decrease, removeItem } = useCartStore();
    const totalAmountInCart = cart?.items?.reduce((acc, item) => acc + item.quantity, 0);
    const totalChosenAmount = cart?.items?.filter((i) => i.checked).reduce((acc, item) => acc + item.quantity, 0);
    const finalPrice = cart?.items
        ?.filter((i) => i.checked)
        .reduce((acc, item) => {
            if (isProductData(item.product)) {
                return acc + item.quantity * item.product?.price;
            } else {
                return 0;
            }
        }, 0);

    return (
        <div className="p-4">
            <h1 className='mb-4'>Cart</h1>
            {cart?.items?.length === 0 && <p>Cart is empty</p>}
            <ItemGroup className="flex w-full max-w-md flex-col gap-6">
                {cart?.items?.map((item) => {
                    const productId = typeof item.product === 'number' ? item.product : item.product.id;
                    console.log(item.product);
                    if (isProductData(item.product)) {
                        const product = item.product;
                        return (
                            <Item variant="outline">
                                <ItemContent className="flex gap-2 flex-row items-center">
                                    <Checkbox
                                        checked={item.checked || false}
                                        onCheckedChange={() => toggleChecked(productId)}
                                        className="mr-2"
                                    />
                                    <div className='flex flex-col'>
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
                    } else return <div>4ilee</div>;
                })}
            </ItemGroup>
            <div className='mt-4'>TOTAL AMOUNT: {totalAmountInCart}</div>
            <div>TOTAL CHOSEN AMOUNT: {totalChosenAmount}</div>
            <div>FINAL PRICE: {finalPrice}</div>
        </div>
    );
}
