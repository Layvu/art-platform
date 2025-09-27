import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import type { IAuthor } from '@/shared/types/author.interface';

export default function AuthorCard({ id, name, slug, bio, productsCount, productCategories, avatar }: IAuthor) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Link href={PAGES.AUTHOR(slug)} className="text-blue-500 hover:underline">
                        {name}
                    </Link>
                </CardTitle>
                <CardDescription>Id: {id}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {bio && <p>Описание: {bio.slice(0, 100)}</p>}

                <span>Общее количество товаров: {productsCount}</span>
                <span>Категории товаров: {productCategories?.join(', ') || ''}</span>

                {avatar && <Image alt="Картинка" src={avatar} width={100} height={52} />}
            </CardContent>

            <CardFooter>
                <Button variant="outline" asChild>
                    <Link href={PAGES.AUTHOR(slug)}>Подробнее</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
