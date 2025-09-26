import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { PayloadService } from '@/services/api/payload-service';

type Params = { author: string }; // authorSlug

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { author } = await params;

    const payloadService = new PayloadService();
    const authorData = await payloadService.getAuthorBySlug(author);

    if (!authorData) {
        return { title: 'Автор не найден' };
    }

    return {
        title: authorData.name,
    };
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
    const { author } = await params;

    const payloadService = new PayloadService();
    const authorData = await payloadService.getAuthorBySlug(author);

    if (!authorData) {
        notFound();
    }

    const { id, name, slug, bio, productsCount, productCategories, avatar } = authorData;

    return (
        <article className="max-w-[800px] mx-auto mt-8 flex flex-col gap-6 border bg-slate-200 p-4 rounded-lg">
            <div>Name: {name}</div>
            <div>Id: {id}</div>
            <div>Slug: {slug}</div>

            {bio ? <p>Описание: {bio.slice(0, 100)}</p> : ''}

            <span>Общее количество товаров: {productsCount}</span>
            <span>Категории товаров: {productCategories?.join(', ') || ''}</span>

            {avatar ? <Image alt="Картинка" src={avatar} width={100} height={52} /> : ''}
        </article>
    );
}
