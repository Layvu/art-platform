'use client';
import React, { useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import CounterButton, { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isAuthorData } from '@/shared/guards/author.guard';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import type { Product } from '@/shared/types/payload-types';
import type { Timer } from '@/shared/types/timer.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getProductQueryOptions } from '@/shared/utils/getDataQueryOptions';

export default function ProductCard({ id, title, slug, price, author, gallery }: Product) {
    const timerRef = useRef<Timer | null>(null);
    const queryClient = getQueryClient();

    const { cart, addItem, increase, decrease } = useCartStore();
    const productInCart = cart?.items?.find((item) =>
        isProductData(item.product) ? item?.product.id == id : item.product == id,
    );
    const handleCardActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const mainImage = gallery && isImageData(gallery[0]?.image) ? gallery[0].image : '';

    const isAvailable = price && price > 0;

    return (
        <Link
            className="col-span-3"
            onMouseEnter={() =>
                (timerRef.current = setTimeout(() => {
                    queryClient.prefetchQuery(getProductQueryOptions({ slug }));
                }, 300))
            }
            onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
            href={PAGES.PRODUCT(slug)}
        >
            <Card className="p-0 h-[480.5px] overflow-hidden">
                <CardHeader className="relative w-full aspect-square overflow-hidden">
                    <Image
                        alt="Картинка"
                        src={(typeof mainImage === 'object' && mainImage?.url) || '/placeholder.png'}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        priority
                    />
                </CardHeader>

                <CardContent className="flex flex-col flex-1 mb-auto">
                    <div className="flex flex-col gap-3 mb-auto">
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>
                            {isAuthorData(author) && (
                                <Link href={PAGES.AUTHOR(author.slug!)} className="text-my-tertriary hover:underline">
                                    {author.name}
                                </Link>
                            )}
                        </CardDescription>
                    </div>
                    <CardAction className="w-full cursor-default" onClick={handleCardActionClick}>
                        {productInCart ? (
                            <CounterButton
                                variant={'default'}
                                quantity={productInCart.quantity}
                                handleMinus={() => decrease(id)}
                                handlePlus={() => increase(id)}
                            ></CounterButton>
                        ) : (
                            <Button
                                className="w-full rounded"
                                variant="secondary"
                                onClick={() => addItem(id)}
                                disabled={!isAvailable}
                            >
                                {isAvailable ? `${price} ₽` : 'Нет в наличии'}
                            </Button>
                        )}
                    </CardAction>
                </CardContent>
            </Card>
        </Link>
    );
}

// TODO: Семантическая вёрстка / tailwind / shadcn
