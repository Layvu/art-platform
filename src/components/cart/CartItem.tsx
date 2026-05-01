'use client';

import React from 'react';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Checkbox } from '@/components/ui/checkbox';
import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import type { ICartItem } from '@/shared/types/cart.interface';
import { cn } from '@/shared/utils/tailwind';

import { Button, CounterButton } from '../ui/button';
import { Card } from '../ui/card';

export default function CartItem({ item, available }: { item: ICartItem; available: boolean }) {
    const { toggleChecked, increase, decrease, removeItem } = useCartStore();

    const product = item.product;

    if (!isProductData(product)) return null;

    const productId = product.id;
    const price = product.price ?? 0;
    const stock = product.quantity ?? 0;

    const mainImage = product.gallery && isImageData(product.gallery[0]?.image) ? product.gallery[0].image : '';

    return (
        <Card className="flex flex-row gap-4 w-full p-0 overflow-hidden items-center">
            <div className="relative shrink-0 w-30 h-30">
                <Link href={PAGES.PRODUCT(product.slug)}>
                    <Image
                        src={(typeof mainImage === 'object' && mainImage?.url) || '/placeholder.png'}
                        alt={product.title}
                        fill
                        className="object-cover rounded-lg"
                    />
                </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-3 flex-row h-full w-full p-4 gap-6">
                <div className="col-span-2 md:col-span-1 flex flex-col flex-1 gap-4 justify-between">
                    <Link href={PAGES.PRODUCT(product.slug)}>
                        <div className="font-semibold leading-tight text-my-primary line-clamp-2">{product.title}</div>
                    </Link>
                    {available && (
                        <div
                            className={cn(
                                'flex items-center gap-2 cursor-pointer select-none transition-colors',
                                item.checked ? 'text-my-accent' : 'text-my-primary',
                            )}
                            onClick={() => toggleChecked(productId)}
                        >
                            <Checkbox checked={item.checked ?? false} onCheckedChange={() => {}} />
                            <span className="text-sm font-medium">Выбрать</span>
                        </div>
                    )}
                </div>

                <div className="col-span-1 flex flex-col gap-2 justify-center items-center text-center">
                    {available && (
                        <div className="text-xl font-bold text-my-primary">
                            {(price * item.quantity).toLocaleString()} ₽
                        </div>
                    )}
                    <div className="text-my-tertriary text-sm">{price.toLocaleString()} ₽ / шт.</div>
                </div>

                <div className="col-span-1 flex flex-col gap-2 justify-center items-center">
                    {available ? (
                        <>
                            <CounterButton
                                variant="secondary"
                                quantity={item.quantity}
                                boundary={stock}
                                handleMinus={() => decrease(productId)}
                                handlePlus={() => increase(productId)}
                            />

                            <div className="text-[15px] text-my-accent font-[450]">В наличии {stock} шт.</div>
                        </>
                    ) : (
                        <Button className="w-full" variant={'pagination'} disabled>
                            Нет в наличии
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
