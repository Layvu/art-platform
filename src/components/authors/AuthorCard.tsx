import { useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import type { Author } from '@/shared/types/payload-types';
import type { Timer } from '@/shared/types/timer.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorQueryOptions } from '@/shared/utils/getDataQueryOptions';

export default function AuthorCard({ id, name, slug, bio, products_count, product_categories, avatar }: Author) {
    const timerRef = useRef<Timer | null>(null);
    const queryClient = getQueryClient();

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Link
                        href={PAGES.AUTHOR(slug!)}
                        className="text-blue-500 hover:underline"
                        onMouseEnter={() =>
                            (timerRef.current = setTimeout(() => {
                                queryClient.prefetchQuery(getAuthorQueryOptions({ slug: slug! }));
                            }, 300))
                        }
                        onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
                    >
                        {name}
                    </Link>
                </CardTitle>
                <CardDescription>Id: {id}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {bio && <p>Описание: {bio.slice(0, 100)}</p>}

                <span>Общее количество товаров: {products_count}</span>
                <span>
                    Категории товаров:{' '}
                    {product_categories?.map((category) => category.category).join(', ') || 'НЕТ КАТЕГОРИЙ'}
                </span>

                {avatar && <Image alt="Картинка" src={avatar} width={100} height={52} />}
            </CardContent>

            <CardFooter>
                <Button variant="outline" asChild>
                    <Link href={PAGES.AUTHOR(slug!)}>Подробнее</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
