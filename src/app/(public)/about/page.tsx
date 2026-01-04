import React from 'react';

import { Clock, Instagram, MapPin, Phone, Plane } from 'lucide-react';

import AboutSlider from '@/components/about/Slider';
import YandexMap from '@/components/about/YandexMap';

export default function AboutPage() {
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

            <AboutSlider />

            <section className="wrap grid grid-cols-[405px_1fr] gap-10 mt-10 mb-10">
                <div className="flex flex-col gap-10 max-w-[405px]">
                    <h2 className="text-4xl font-medium">Как нас найти?</h2>
                    <ul className="flex flex-col gap-10">
                        <li className="flex flex-col gap-6">
                            <h3 className="text-xl font-medium underline">Месторасположение</h3>
                            <div className="flex flex-col gap-5">
                                <div className="flex gap-4">
                                    <MapPin />
                                    Улица Добролюбова, 2Б
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
                <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-md">
                    <YandexMap />
                </div>
            </section>
        </section>
    );
}

// TODO: Метатеги
