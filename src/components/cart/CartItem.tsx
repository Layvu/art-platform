'use client';

import React from 'react';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';

import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/services/store/cart/store';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import type { ICartItem } from '@/shared/types/cart.interface';

import { CounterButton } from '../ui/button';
import { Card } from '../ui/card';

export default function CartItem({ item }: { item: ICartItem }) {
    const { toggleChecked, increase, decrease, removeItem } = useCartStore();

    const productId = typeof item.product === 'number' ? item.product : item.product.id;
    const product = item.product;
    if (!isProductData(product)) return <div className="wrap">No product found</div>;

    const mainImage = product.gallery && isImageData(product.gallery[0]?.image) ? product.gallery[0].image : '';

    return (
        <Card className="grid grid-cols-4 gap-x-4 w-full items-center">
            <div className="col-span-2 flex gap-4 flex-row">
                <div className="flex flex-col justify-between items-center">
                    <Checkbox
                        checked={item.checked || false}
                        onCheckedChange={() => toggleChecked(productId)}
                        className=""
                    />
                    <Trash2
                        onClick={() => removeItem(productId)}
                        size={24}
                        className="text-zinc-400"
                        cursor={'pointer'}
                    />
                </div>
                {mainImage && (
                    <Image
                        src={mainImage.url || ''}
                        alt={product.title}
                        width={72}
                        height={72}
                        className="w-18 h-18 object-cover rounded-lg"
                    />
                )}
                <div className="font-semibold content-center">{product.title}</div>
            </div>
            <div className="col-span-1">
                <div className="font-semibold text-xl">Цена: {product.price}</div>
            </div>
            <div className="col-span-1">
                <CounterButton
                    variant="outline"
                    quantity={item.quantity}
                    increase={increase}
                    decrease={decrease}
                    id={productId}
                />
            </div>
        </Card>
    );
}
