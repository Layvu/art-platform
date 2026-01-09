'use client';

import React from 'react';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { useFetchAuthor } from '@/shared/hooks/useFetchData';
import type { AuthorQueryParams, ProductsQueryParams } from '@/shared/types/query-params.type';

import { isImageData } from '../../shared/guards/image.guard';
import ProductsUI from '../products/ProductsUI';
import { Button } from '../ui/button';

export default function AuthorUI({
    initialParams,
    searchParams,
}: {
    initialParams: AuthorQueryParams;
    searchParams: ProductsQueryParams;
}) {
    console.log(initialParams, 'au');

    const slug = initialParams.author;
    const { data, isError, error, isFetching } = useFetchAuthor({ slug });

    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!data) {
        notFound();
    }

    const { name, avatar, bio } = data;

    return (
        <div className="wrap mt-10">
            <div className="bg-zinc-100 p-9 flex gap-6 mb-12">
                <Image
                    src={isImageData(avatar) ? avatar?.url || '' : ''}
                    alt={'avatar'}
                    width={115}
                    height={115}
                    className="rounded-full object-cover h-[115px] w-[115px]"
                />
                <div className="flex gap-6 flex-1">
                    <div className="flex flex-col gap-4 flex-1">
                        <h2 className="text-2xl font-semibold text-black">{name}</h2>
                        <p className="text-lg text-zinc-600 font-normal">{bio}</p>
                    </div>
                    <Button className="" variant={'outline'}>
                        Соц-сети автора <ExternalLink />
                    </Button>
                </div>
            </div>

            <ProductsUI initialParams={{ ...searchParams, authors: name! }} showAuthorFilter={false} />
        </div>
    );
}
