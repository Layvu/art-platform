'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { isAuthorData } from '@/shared/guards/author.guard';
import { isImageData } from '@/shared/guards/image.guard';
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

    const { id, title, description, gallery, price, author } = data;
    console.log('image:', gallery);

    return (
        <Card className="max-w-[800px] mx-auto mt-8">
            <CardHeader>
                <div className="flex items-center gap-4">
                    {/* {isImageData(image) && (
                        <Image
                            src={image.url || ''}
                            alt={title}
                            width={500}
                            height={500}
                            style={{ objectFit: 'cover' }}
                        />
                    )} */}

                    {/* На случай если контейнер будет прямоугольным */}
                    {/* {isImageData(image) && (
                        <div className="w-[500px] aspect-video relative">
                            <Image src={image.url || ''} alt={title} fill className="object-cover" />
                        </div>
                    )} */}

                    {/* квадратным */}
                    {gallery?.map((galleryItem) => {
                        if (isImageData(galleryItem.image)) {
                            const image = galleryItem.image;
                            return (
                                <div key={galleryItem.id} className="w-[500px] aspect-square relative">
                                    <Image src={image.url || ''} alt={title} fill className="object-cover" />
                                </div>
                            );
                        } else return null;
                    })}

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
                        <Link href={PAGES.AUTHOR(author.slug!)} className="hover:underline text-blue-500">
                            @{author.name}
                        </Link>
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}
