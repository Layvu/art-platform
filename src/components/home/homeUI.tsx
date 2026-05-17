'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useFetchAuthors, useFetchHomeSlider, useFetchProducts } from '@/shared/hooks/useFetchData';

import JoinTeamSection from '../about/JoinTeamSection';
import AuthorCard from '../authors/AuthorCard';
import { Skeleton } from '../ui/skeleton';

import HomeSlider from './HomeSlider';

export default function HomeUI() {
    const { data: products } = useFetchProducts({ limit: 4 });
    const { data: authors } = useFetchAuthors({ limit: 4 });
    const { data: slides, isLoading: isSliderLoading } = useFetchHomeSlider();

    return (
        <div className="mb-10 md:mb-18">
            <div className="wrap flex flex-col gap-12 md:gap-20 lg:gap-26">
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
            </div>
            <div className="md:mt-20 lg:mt-26">
                <JoinTeamSection />
            </div>
        </div>
    );
}
