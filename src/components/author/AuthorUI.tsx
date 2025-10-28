'use client';

import React from 'react';

import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useFetchAuthor } from '@/shared/hooks/useFetchData';
import type { AuthorQueryParams } from '@/shared/types/query-params.type';

export default function AuthorUI({ initialParams }: { initialParams: AuthorQueryParams }) {
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

    const { id, name, avatar, bio, product_categories, products_count } = data;

    return (
        <Card className="max-w-[800px] mx-auto mt-8">
            <CardHeader>
                <div className="flex items-center gap-4">
                    {avatar && <Image src={avatar} alt={name} width={48} height={48} />}
                    <div>
                        <h2 className="text-lg font-semibold">{name}</h2>
                        <p className="text-sm text-gray-500">Id: {id}</p>
                        <p className="text-sm text-gray-500">Slug: {slug}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {bio && <p>{bio.slice(0, 100)}</p>}
                <span>Общее количество товаров: {products_count}</span>
                <span>
                    Категории товаров:{' '}
                    {product_categories?.map((category) => category.category).join(', ') || 'НЕТ КАТЕГОРИЙ'}
                </span>
            </CardContent>
        </Card>
    );
}
