'use client';

import React from 'react';

import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PAGES } from '@/config/public-pages.config';
import { useCartStore } from '@/services/store/cart/store';
import { isAuthorData } from '@/shared/guards/author.guard';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import { useFetchProduct } from '@/shared/hooks/useFetchData';
import type { Media } from '@/shared/types/payload-types';
import type { ProductQueryParams } from '@/shared/types/query-params.type';

import { Button } from '../ui/button';

import ProductSlider from './ProductSlider';

import './product.scss';

export default function ProductUI({ initialParams }: { initialParams: ProductQueryParams }) {
    const slug = initialParams.product;
    const { data, isError, error, isFetching } = useFetchProduct({ slug });
    const { cart, addItem, increase, decrease } = useCartStore();

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
    const productInCart = cart?.items?.find((item) =>
        isProductData(item.product) ? item?.product.id == id : item.product == id,
    );

    const images = gallery?.map((galleryItem) => galleryItem.image).filter((image) => isImageData(image)) || [];
    return (
        <div className="wrap mt-8 grid grid-cols-12 gap-x-10 h-[617px] overflow-hidden mb-20">
            <div className="col-span-7">
                <ProductSlider gallery={images as Media[]} />
            </div>

            <div className="col-span-5 ">
                <div className="flex flex-col gap-8 mb-26">
                    <h2 className=" font-semibold text-[32px] leading-10 ">{title}</h2>
                    {productInCart ? (
                        <div className="flex w-full gap-1 items-center justify-center bg-linear-to-l from-orange-400 to-orange-500 text-white rounded">
                            <Button className="p-0" onClick={() => decrease(id)} variant="empty">
                                <Minus />
                            </Button>
                            <div className="px-2">{productInCart.quantity}</div>
                            <Button className="p-0" onClick={() => increase(id)} variant="empty">
                                <Plus />
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full rounded" variant="default" onClick={() => addItem(id)}>
                            {price} ₽
                        </Button>
                    )}
                </div>
                <div className="flex flex-col gap-10">
                    {description && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-2xl font-semibold">Описание</h3>
                            <div className="text-zinc-600">{description}</div>
                        </div>
                    )}
                    {/* TODO характеристики     */}

                    {isAuthorData(author) && (
                        <div className="flex gap-3">
                            <Image
                                width={40}
                                height={40}
                                src={isImageData(author.avatar) ? author.avatar?.url || '' : ''}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            ></Image>
                            <Link href={PAGES.AUTHOR(author.slug!)} className="hover:underline text-2xl font-semibold">
                                {author.name}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
