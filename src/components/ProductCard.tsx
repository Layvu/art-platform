import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import type { IProduct } from '@/shared/types/product.interface';

export default function ProductCard({ id, title, slug, description, price, author, image }: IProduct) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Link href={PAGES.PRODUCT(slug)} className="text-blue-500 hover:underline">
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

                <p className="text-sm text-gray-500">
                    <Link href={PAGES.AUTHOR(author.slug)} className="hover:underline">
                        @{author.name}
                    </Link>
                </p>

                {image && <Image alt="Картинка" src={image} width={100} height={52} />}
            </CardContent>

            <CardFooter>
                <Button variant="outline" asChild>
                    <Link href={PAGES.PRODUCT(slug)}>Подробнее</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

// TODO: Семантическая вёрстка / tailwind / shadcn
