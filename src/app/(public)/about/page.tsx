import React from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import AboutSlider from '@/components/about/Slider';
import YandexMap from '@/components/about/YandexMap';
import Link from 'next/link';
import type { Metadata } from 'next';
import JoinTeamSection from '@/components/about/JoinTeamSection';

export const metadata: Metadata = {
    title: 'О нас | МИНТО — Маркет авторских работ',
    description:
        'МИНТО — это пространство в Екатеринбурге, где художники и мастера могут арендовать полки для своих уникальных товаров.',
};

export default function AboutPage() {
    return (
        <section className="flex flex-col gap-30">
            <section className="wrap grid grid-cols-1 lg:grid-cols-12 relative p-8 gap-16 shadow-[0_3px_40px_0_rgba(39,39,42,0.05)]">
                <div className="lg:col-span-5">
                    <div className="flex flex-col gap-6">
                        <h1 className="text-[32px] font-semibold leading-tight">Привет и добро пожаловать в МИНТО!</h1>
                        <p className=" leading-relaxed">
                            МИНТО — это место, где каждый автор может арендовать полочку и представить свои работы. Мы
                            поддерживаем талантливых художников и мастеров, помогая им находить покупателей и
                            вдохновляться на создание нового и уникального.
                        </p>
                    </div>
                </div>
                <div className="lg:col-span-7 w-full overflow-hidden rounded-xl">
                    <AboutSlider />
                </div>
            </section>

            <JoinTeamSection />

            <section className="wrap mb-20">
                <h2 className="text-[32px] font-semibold mb-8">Как нас найти?</h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <ul className="lg:col-span-4 flex flex-col gap-4">
                        <li className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-xl font-semibold">Месторасположение</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-primary size-5" />
                                    <span>улица Горького, 33, Екатеринбург</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-primary size-5" />
                                    <span>10:00 — 22:00</span>
                                </div>
                            </div>
                        </li>

                        <li className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-xl font-semibold">Контакты</h3>
                            <div className="flex items-center gap-3">
                                <Phone className="text-primary size-5" />
                                <a href="tel:+79995619915" className="hover:text-primary transition-colors">
                                    +7 (999) 561-99-15
                                </a>
                            </div>
                        </li>

                        <li className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-xl font-semibold">Социальные сети</h3>
                            <div className="flex flex-col flex-wrap gap-4">
                                <Link href="#" className="flex items-center gap-2 hover:text-my-accent">
                                    <img src="/icons/vk.svg" alt="VK" className="w-6 h-6" />
                                    <span className="text-sm font-medium">Вконтакте</span>
                                </Link>
                                <Link href="#" className="flex items-center gap-2 hover:text-my-accent">
                                    <img src="/icons/telegram.svg" alt="Telegram" className="w-6 h-6" />
                                    <span className="text-sm font-medium">Telegram</span>
                                </Link>
                                <Link href="#" className="flex items-center gap-2 hover:text-my-accent">
                                    <img src="/icons/tiktok.svg" alt="TikTok" className="w-6 h-6" />
                                    <span className="text-sm font-medium">TikTok</span>
                                </Link>
                            </div>
                        </li>
                    </ul>

                    {/* Карта */}
                    <div className="col-span-8 h-full overflow-hidden">
                        <YandexMap />
                    </div>
                </div>
            </section>
        </section>
    );
}
