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
            <Card className="h-[480.5px] overflow-hidden">
                <CardHeader className="relative w-full aspect-square overflow-hidden">
                    {mainImage ? (
                        <Image
                            alt="Картинка"
                            src={mainImage.url || ''}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                            priority
                        />
                    ) : null}
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
                            <div className="flex p-0.5 w-full gap-1 items-center justify-between text-white rounded-lg bg-my-button-primary-default">
                                <Button className="p-0 w-9" onClick={() => decrease(id)} variant="empty">
                                    <Minus width={36} height={36} />
                                </Button>
                                <div className="px-2">{productInCart.quantity}</div>
                                <Button className="p-0 w-9" onClick={() => increase(id)} variant="empty">
                                    <Plus width={36} height={36} />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full rounded"
                                variant="secondary"
                                onClick={() => addItem(id)}
                                disabled={!isAvailable}
                            >
                                {isAvailable ? `${price} ₽` : 'Ждём поступления!'}
                            </Button>
                        )}
                    </CardAction>
                </CardContent>
                {/* <CardFooter className="flex flex-col gap-2"></CardFooter> */}
            </Card>
        </Link>
    );
}

// TODO: Семантическая вёрстка / tailwind / shadcn
