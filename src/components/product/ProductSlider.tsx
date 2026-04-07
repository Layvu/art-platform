'use client';

import React, { useRef } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Slider from 'react-slick';

import type { Media } from '@/shared/types/payload-types';

type Props = {
    gallery: Media[];
};

export default function ProductSlider({ gallery }: Props) {
    const mainSlider = useRef<Slider | null>(null);
    const thumbSlider = useRef<Slider | null>(null);

    if (!gallery?.length) return null;

    const mainSettings = {
        asNavFor: thumbSlider.current as Slider | undefined,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 0,
    };

    const thumbSettings = {
        asNavFor: mainSlider.current as Slider | undefined,
        slidesToShow: 5,
        slidesToScroll: 1,
        vertical: true,
        focusOnSelect: true,
        arrows: false,
        infinite: true,
        draggable: true,
        speed: 400,
    };

    
    return (
        <div className="flex gap-5">
            <div className="w-24 flex h-145">
                <Slider ref={thumbSlider} {...thumbSettings}>
                    {gallery.map((img) => (
                        <div key={img.id} className="px-0 py-3 outline-none">
                            <div className="relative w-24 h-24 overflow-hidden rounded-lg cursor-pointer">
                                <Image src={img.url!} alt={img.filename ?? ''} fill className="object-cover" />
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>

            <div className="relative w-145 h-145 pt-3">
                <Slider ref={mainSlider} {...mainSettings}>
                    {gallery.map((img) => (
                        <div key={img.id}>
                            <div className="relative w-145 h-145 overflow-hidden rounded-lg">
                                <Image src={img.url!} alt={img.filename ?? ''} fill priority className="object-cover" />
                            </div>
                        </div>
                    ))}
                </Slider>

                <button
                    onClick={() => mainSlider.current?.slickPrev()}
                    className="absolute left-3 top-1/2 -translate-y-1/2
                     bg-white/80 hover:bg-white rounded-md p-2 shadow cursor-pointer"
                >
                    <ChevronLeft />
                </button>

                <button
                    onClick={() => mainSlider.current?.slickNext()}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                     bg-white/80 hover:bg-white rounded-md p-2 shadow cursor-pointer"
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    );
}
