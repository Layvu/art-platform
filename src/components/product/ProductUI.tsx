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
import type { ProductQueryParams, ProductsQueryParams } from '@/shared/types/query-params.type';

import CounterButton, { Button } from '../ui/button';

import ProductSlider from './ProductSlider';

import './product.scss';
import AuthorProductsSection from './AuthorProductsSection';
import { useUpdateQueryParams } from '@/shared/hooks/useUpdateQueryParams';

export default function ProductUI({ initialParams }: { initialParams: ProductQueryParams }) {
    const slug = initialParams.product;
    const { data: product, isError, error, isFetching } = useFetchProduct({ slug });
    const { cart, addItem, increase, decrease } = useCartStore();
    const updateQueryParams = useUpdateQueryParams<ProductsQueryParams>();

    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!product) {
        notFound();
    }

    const { id, title, description, gallery, price, author, quantity } = product;
    const productInCart = cart?.items?.find((item) =>
        isProductData(item.product) ? item?.product.id == id : item.product == id,
    );
    const isAvailable = price && price > 0 && quantity && quantity > 0;

    const images = gallery?.map((galleryItem) => galleryItem.image).filter((image) => isImageData(image)) || [];

    return (
        <div className="flex flex-col gap-12 wrap mt-8">
            <div className="grid grid-cols-12 gap-x-10 overflow-hidden p-8 pt-5 mb-20 shadow-[0_3px_40px_0_rgba(39,39,42,0.05)]  rounded-xl">
                <div className="col-span-7">
                    <ProductSlider gallery={images as Media[]} />
                </div>

                <div className="col-span-5 ">
                    <div className="flex flex-col gap-8 mb-26">
                        <h2 className=" font-semibold text-[32px] leading-10 ">{title}</h2>

                        <div className="flex flex-col gap-2">
                            {productInCart ? (
                                <CounterButton
                                    quantity={productInCart.quantity}
                                    handleMinus={() => decrease(id)}
                                    handlePlus={() => increase(id)}
                                    variant={'default'}
                                ></CounterButton>
                            ) : (
                                <Button
                                    className="w-full rounded cursor-pointer"
                                    variant="default"
                                    onClick={() => addItem(id)}
                                    disabled={!isAvailable}
                                >
                                    {isAvailable ? `${price} ₽` : 'Ждём поступления!'}
                                </Button>
                            )}
                            {!!quantity && quantity > 0 && <span className="text-my-accent font-[450]">В наличии {quantity} шт</span>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">
                        {description && (
                            <div className="flex flex-col gap-3">
                                <h3 className="text-2xl font-semibold">Описание</h3>
                                <div className="text-zinc-600 text-lg">{description}</div>
                            </div>
                        )}

                        {isAuthorData(author) && (
                            <div className="flex flex-col gap-3">
                                <h3 className="text-2xl font-semibold">Автор</h3>

                                <Link
                                    href={PAGES.AUTHOR(author.slug!)}
                                    className=" flex gap-3 items-center hover:underline text-my-secondary text-[16px] cursor-pointer"
                                >
                                    <Image
                                        width={40}
                                        height={40}
                                        src={
                                            isImageData(author.avatar)
                                                ? author.avatar?.url || '/placeholder.png'
                                                : '/placeholder.png'
                                        }
                                        alt="avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    ></Image>

                                    {author.name}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AuthorProductsSection product={product} updateQueryParams={updateQueryParams} />
        </div>
    );
}
