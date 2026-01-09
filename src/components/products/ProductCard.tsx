'use client';

import { useRef } from 'react';

import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
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

    const mainImage = gallery && isImageData(gallery[0]?.image) ? gallery[0].image : '';

    return (
        <Card className="max-w-[294px]">
            <CardHeader className="flex flex-1 aspect-square relative items-center">
                {mainImage ? (
                    <Image
                        alt="Картинка"
                        src={mainImage.url || ''}
                        width={262}
                        height={262}
                        // fill

                        className="object-contain flex-1 "
                        priority
                    />
                ) : null}
            </CardHeader>

            <CardContent className="flex flex-col gap-5 px-0">
                <div className="flex flex-col gap-2">
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
                        >
                            {title}
                        </Link>
                    </CardTitle>
                    <CardDescription>
                        {isAuthorData(author) && (
                            <Link href={PAGES.AUTHOR(author.slug!)} className="hover:underline">
                                @{author.name}
                            </Link>
                        )}
                    </CardDescription>
                </div>
                <CardAction className="w-full">
                    {/* <Button variant="outline" asChild>
                        <Link href={PAGES.PRODUCT(slug)}>Подробнее</Link>
                    </Button> */}
                    {productInCart ? (
                        <div className="flex w-full gap-1 items-center justify-center bg-linear-to-l from-orange-400 to-orange-500 text-white rounded">
                            <Button className="p-0" onClick={() => decrease(id)} variant="empty">
                                <Minus />
                            </Button>
                            <div className="px-2">{productInCart.quantity}</div>
                            <Button className="p-0" onClick={() => increase(id)} variant="empty">
                                <Plus />
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full rounded" variant="default" onClick={() => addItem(id)}>
                            {price}
                        </Button>
                    )}
                </CardAction>
            </CardContent>

            {/* <CardFooter className="flex flex-col gap-2"></CardFooter> */}
        </Card>
    );
}

// TODO: Семантическая вёрстка / tailwind / shadcn
