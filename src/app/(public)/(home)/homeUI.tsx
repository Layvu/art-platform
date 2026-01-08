'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useFetchAuthors, useFetchProducts } from '@/shared/hooks/useFetchData';

export default function HomeUI() {
    const { data: products } = useFetchProducts({ limit: 4 });
    const { data: authors } = useFetchAuthors({ limit: 4 });

    return (
        <div className="wrap mb-18 flex flex-col gap-26">
            <div className="flex flex-col gap-6">
                <div className="flex justify-between">
                    <h2 className="text-2xl font-semibold">Новые товары</h2>
                    <Button className="w-fit" variant="outline" onClick={() => {}}>
                        <Link href="/products">Показать все</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products?.docs?.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>

            <div className="h-[250px] pl-15 bg-orange-100 flex gap-10">
                <div className="w-1/2 pt-10 pb-10 flex gap-10 flex-col">
                    <h2 className="text-zinc-900 font-semibold text-3xl leading-10">
                        Дорогие авторы, мы открыты к сотрудничеству и ждем ваши анкеты!
                    </h2>
                    <Button className="w-fit px-11" onClick={() => {}}>
                        Заполнить анкету
                    </Button>
                </div>
                <Image
                    height={250}
                    width={600}
                    className="w-1/2 object-cover"
                    src="/kirpichi_signboard.png"
                    alt="Kirpichi signboard"
                />
            </div>
        </div>
    );
}
