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
import Link from 'next/link';

export default function AuthorUI({
    initialParams,
    searchParams,
}: {
    initialParams: AuthorQueryParams;
    searchParams: ProductsQueryParams;
}) {
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

    const { name, avatar, bio, externalLink, cover } = data;

    return (
        <div className="mt-8 relative">
            {cover && (
                <div className="absolute top-0 left-0 w-full h-30 z-0 overflow-hidden">
                    <Image
                        src={isImageData(cover) ? cover?.url || '' : ''}
                        alt="background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}
            <div className="relative z-10 p-9 flex mb-12 wrap">
                <Image
                    src={isImageData(avatar) ? avatar?.url || '/placeholder.png' : '/placeholder.png'}
                    alt={'avatar'}
                    width={160}
                    height={160}
                    className="rounded-full object-cover h-40 w-40 border-6 border-white absolute"
                />
                <div className="h-fit flex gap-6 flex-1 items-center bg-white pl-4 pt-3 pr-4 pb-5 rounded-tr-xl mt-15 ml-39">
                    <div className="flex flex-col gap-2 flex-1">
                        <h2 className="text-3xl font-semibold text-black">{name}</h2>
                        <p className="text-lg text-my-primary font-normal">{bio}</p>
                    </div>
                    {externalLink && (
                        <Link
                            href={externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-my-accent hover:underline transition-colors"
                        >
                            Соц-сети автора <ExternalLink size={24} />
                        </Link>
                    )}
                </div>
            </div>

            <ProductsUI initialParams={{ ...searchParams, authors: name! }} showAuthorFilter={false} />
        </div>
    );
}
