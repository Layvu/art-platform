'use client';

import { useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { getQueryClient } from '@/lib/utils/get-query-client';
import { useCartStore } from '@/services/store/cart/store';
import { isAuthorData } from '@/shared/guards/author.guard';
import type { Product } from '@/shared/types/payload-types';
import type { Timer } from '@/shared/types/timer.type';
import { getProductQueryOptions } from '@/shared/utils/getDataQueryOptions';

import { isProductData } from '../../shared/guards/product.guard';

export default function ProductCard({ id, title, slug, description, price, author, image, category }: Product) {
    const timerRef = useRef<Timer | null>(null);
    const queryClient = getQueryClient();

    const { cart, addItem, increase, decrease } = useCartStore();
    const productInCart = cart?.items?.find((item) =>
        isProductData(item.product) ? item?.product.id == id : item.product == id,
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {/* TODO мб перетащить линку на повыше */}
                    <Link
                        onMouseEnter={() =>
                            (timerRef.current = setTimeout(() => {
                                queryClient.prefetchQuery(getProductQueryOptions({ slug }));
                            }, 300))
                        }
                        onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
                        href={PAGES.PRODUCT(slug)}
                        className="text-blue-500 hover:underline"
                    >
                        {title}
                    </Link>
                </CardTitle>
                <CardDescription>Id: {id}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {description ? (
                    <p>Описание: {description.slice(0, 100)}</p>
                ) : (
                    <p className="text-muted-foreground">Нет описания</p>
                )}
                <span>Цена: {price}</span>
                {isAuthorData(author) && (
                    <p className="text-sm text-gray-500">
                        <Link href={PAGES.AUTHOR(author.slug)} className="hover:underline">
                            @{author.name}
                        </Link>
                    </p>
                )}

                {image && <Image alt="Картинка" src={image} width={100} height={52} />}
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                    <Link href={PAGES.PRODUCT(slug)}>Подробнее</Link>
                </Button>
                {productInCart ? (
                    <div className="flex gap-1.5 items-center">
                        <Button onClick={() => decrease(id)} variant="outline">
                            -
                        </Button>
                        {productInCart.quantity}
                        <Button onClick={() => increase(id)} variant="outline">
                            +
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => addItem(id)}>
                        Добавить в корзину
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

// TODO: Семантическая вёрстка / tailwind / shadcn
