'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useFetchAuthors, useFetchHomeSlider, useFetchProducts } from '@/shared/hooks/useFetchData';

import AuthorCard from '../authors/AuthorCard';
import { Skeleton } from '../ui/skeleton';

import HomeSlider from './HomeSlider';

export default function HomeUI() {
    const { data: products } = useFetchProducts({ limit: 4 });
    const { data: authors } = useFetchAuthors({ limit: 4 });
    const { data: slides, isLoading: isSliderLoading } = useFetchHomeSlider();

    return (
        <div className="wrap mb-10 md:mb-18 flex flex-col gap-12 md:gap-20 lg:gap-26">
            {isSliderLoading ? <Skeleton className="h-screen w-full mb-4" /> : <HomeSlider slides={slides?.docs} />}

            {/* Новые товары */}
            <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-semibold">Новые товары</h2>
                    <Button className="w-fit" asChild>
                        <Link href="/products">Показать все</Link>
                    </Button>
                </div>
                <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {products?.docs?.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>

            {/* Новые авторы */}
            <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-semibold">Новые авторы</h2>
                    <Button className="w-fit" asChild>
                        <Link href="/authors">Показать все</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {authors?.docs?.map((author) => (
                        <AuthorCard key={author.id} {...author} />
                    ))}
                </div>
            </div>

            {/* Баннер для авторов */}
            <div className="rounded-xl overflow-hidden bg-blue-100/50 flex flex-col sm:flex-row min-h-[200px] md:h-[250px]">
                <div className="flex-1 p-6 md:pl-12 lg:pl-15 md:pt-10 md:pb-10 flex flex-col gap-5 md:gap-10 justify-center">
                    <h2 className="font-semibold md:text-xl lg:text-2xl leading-tight">
                        Дорогие авторы, мы открыты к сотрудничеству и ждем ваши анкеты!
                    </h2>
                    <Button className="w-fit px-8 md:px-11" asChild>
                        <Link href="/questionnaire">Заполнить анкету</Link>
                    </Button>
                </div>
                <div className="relative h-48 sm:h-auto sm:w-1/2 hrink-0">
                    <Image fill className="object-cover" src="/homeslider/1.png" alt="minto signboard" />
                </div>
            </div>
        </div>
    );
}
