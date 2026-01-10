'use client';

import React, { useRef } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './home-slider.scss';
import { Badge } from '../ui/badge';
import Image from 'next/image';

export default function HomeSlider() {
    const sliderRef = useRef<Slider | null>(null);

    const settings = {
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        centerMode: true,
        centerPadding: '0px',
        arrows: false,
        draggable: true,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 1 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <div className="relative home-slider wrap">
            <Slider ref={sliderRef} {...settings}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n}>
                        <div className="h-[500px] rounded-lg shadow-md grid grid-cols-12 gap-x-10 pl-10">
                            <div className="col-span-5">
                                <div className="flex flex-col h-full justify-between py-10">
                                    <div className="flex flex-col gap-10">
                                        <div className="flex flex-col gap-5">
                                            <h2 className="text-3xl font-semibold">Фотовыставка “Восхождение”</h2>
                                            <Badge>открытие 3 ноября</Badge>
                                        </div>
                                        <p className="text-lg text-zinc-600">
                                            Выставка посвящена Горам – удивительному месту, побывав в котором один раз,
                                            уже невозможно забыть его и появляется непреодолимое желание возвращаться
                                            сюда снова и снова.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="rounded-full bg-zinc-300 w-8 h-8"></div>
                                        <div className="font-semibold">Антон Морозов</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-7 relative h-full">
                                <Image src="/homeslider/1.png" alt="pic" fill className="object-cover" />
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2
                           bg-white/80 hover:bg-white rounded-full p-2 shadow z-10 cursor-pointer"
            >
                <ChevronLeft />
            </button>

            <button
                onClick={() => sliderRef.current?.slickNext()}
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2
                           bg-white/80 hover:bg-white rounded-full p-2 shadow z-10 cursor-pointer"
            >
                <ChevronRight />
            </button>
        </div>
    );
}
