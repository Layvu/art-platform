'use client';

import React, { type CSSProperties } from 'react';

import { CheckIcon, Clock, Instagram, MapPin, Phone, Plane } from 'lucide-react';
import Slider from 'react-slick';

interface ArrowProps {
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

function SampleNextArrow(props: ArrowProps) {
    const { className, style, onClick } = props;
    return <div className={className} style={{ ...style, display: 'block', background: 'red' }} onClick={onClick} />;
}

function SamplePrevArrow(props: ArrowProps) {
    const { className, style, onClick } = props;
    return (
        <div className={className} style={{ ...style, display: 'block', backgroundColor: 'green' }} onClick={onClick} />
    );
}

export default function AboutPage() {
    const settings = {
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        focusOnSelect: true,
        autoplay: true,
        centerMode: true,
        centerPadding: '0px',
        autoplaySpeed: 2500,
        draggable: true,
        arrows: true,
        // nextArrow: <SampleNextArrow />,
        // prevArrow: <SamplePrevArrow />,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: '0px' } },
            { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: '0px' } },
        ],
    };

    const images = [
        'https://images.unsplash.com/photo-1507149833265-60c372daea22?w=800',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800',
        'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800',
        'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800',
        'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800',
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800',
        'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800',
    ];

    return (
        <section className="">
            <header className="wrap">
                <h1 className="text-2xl font-bold mb-6">Кирпичи</h1>
                <div className="mb-4">
                    Арт-пространство «Кирпичи» появилось в Екатеринбурге относительно недавно, но уже стало местом
                    притяжения для тех, кто жаждет новых впечатлений и хочет каждый день открывать что-то новое. Здесь
                    на регулярной основе проводятся выставки и лектории, устраиваются модные показы, организуются
                    мастер-классы. Почти всегда в продаже представлены эксклюзивные изделия местных и не только
                    мастеров.
                </div>
            </header>

            <Slider {...settings} className="mx-auto mt-10 h-[501px] flex text-center">
                {images.map((url, i) => (
                    <div key={i} className="px-2 wrap">
                        <img
                            src={url}
                            alt={`Slide ${i + 1}`}
                            className="rounded-2xl w-full object-cover shadow-md h-[501px] "
                        />
                    </div>
                ))}
            </Slider>

            <section className="wrap grid grid-cols-[405px_1fr] gap-10 mt-10 mb-10">
                <div className="flex flex-col gap-10 max-w-[405px]">
                    <h2 className="text-4xl font-medium">Как нас найти?</h2>
                    <ul className="flex flex-col gap-10">
                        <li className="flex flex-col gap-6">
                            <h3 className="text-xl font-medium underline">Месторасположение</h3>
                            <div className="flex flex-col gap-5">
                                <div className="flex gap-4">
                                    <MapPin />
                                    ​Улица Добролюбова, 2Б
                                </div>
                                <div className="flex gap-4">
                                    <Clock />
                                    11:00 — 20:00
                                </div>
                            </div>
                        </li>
                        <li className="flex flex-col gap-6">
                            <h3 className="text-xl font-medium underline">Контакты</h3>
                            <div className="flex gap-4">
                                <Phone />
                                +7 (343) 240‒50‒40
                            </div>
                        </li>
                        <li className="flex flex-col gap-6">
                            <h3 className="text-xl font-medium underline">Социальные сети</h3>
                            <div className="flex gap-5">
                                <a href="#">
                                    <Instagram />
                                </a>
                                <a href="#">
                                    <Plane />
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="w-full h-full bg-gray-200 rounded-2xl"></div>
            </section>
        </section>
    );
}

function CenterMode() {
    const settings = {
        className: 'center',
        centerMode: true,
        infinite: true,
        centerPadding: '60px',
        slidesToShow: 3,
        speed: 500,
    };
    return (
        <div className="slider-container">
            <Slider {...settings}>
                <div>
                    <h3>1</h3>
                </div>
                <div>
                    <h3>2</h3>
                </div>
                <div>
                    <h3>3</h3>
                </div>
                <div>
                    <h3>4</h3>
                </div>
                <div>
                    <h3>5</h3>
                </div>
                <div>
                    <h3>6</h3>
                </div>
            </Slider>
        </div>
    );
}

// TODO: Метатеги
