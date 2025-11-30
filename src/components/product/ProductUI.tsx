'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { isAuthorData } from '@/shared/guards/author.guard';
import { useFetchProduct } from '@/shared/hooks/useFetchData';
import type { ProductQueryParams } from '@/shared/types/query-params.type';

export default function ProductUI({ initialParams }: { initialParams: ProductQueryParams }) {
    const slug = initialParams.product;
    const { data, isError, error, isFetching } = useFetchProduct({ slug });

    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!data) {
        notFound();
    }

    const { id, title, description, image, price, author } = data;

    return (
        <Card className="max-w-[800px] mx-auto mt-8">
            <CardHeader>
                <div className="flex items-center gap-4">
                    {image && <Image src={image} alt={title} width={48} height={48} />}
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="text-sm text-gray-500">Id: {id}</p>
                        <p className="text-sm text-gray-500">Slug: {slug}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {description && <p>{description.slice(0, 100)}</p>}
                <span>Цена: {price}</span>
            </CardContent>

            {isAuthorData(author) && (
                <CardFooter>
                    <p className="text-sm text-gray-500">
                        <Link href={PAGES.AUTHOR(author.slug)} className="hover:underline text-blue-500">
                            @{author.name}
                        </Link>
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}
