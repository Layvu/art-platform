import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PAGES } from '@/config/public-pages.config';
import { PayloadService } from '@/services/api/payload-service';

type Params = { product: string }; // productSlug

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { product } = await params;

    const payloadService = new PayloadService();
    const productData = await payloadService.getProductBySlug(product);

    if (!productData) {
        return { title: 'Продукт не найден' };
    }

    return {
        title: productData.title,
    };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
    const { product } = await params;

    const payloadService = new PayloadService();
    const productData = await payloadService.getProductBySlug(product);

    if (!productData) {
        notFound();
    }

    const { id, title, slug, description, price, author, image } = productData;

    return (
        <article className="max-w-[800px] mx-auto mt-8 flex flex-col gap-6 border bg-slate-200 p-4 rounded-lg">
            <div>Title: {title}</div>
            <div>Id: {id}</div>
            <div>Slug: {slug}</div>

            {description ? <p>{description.slice(0, 100)}</p> : ''}
            <span>{price}</span>

            <p className="text-sm text-gray-500">
                <Link href={PAGES.AUTHOR(author.slug)} className="hover:underline text-blue-500">
                    @{author.name}
                </Link>
            </p>

            {image ? <Image alt="Картинка" src={image} width={100} height={52} /> : ''}
        </article>
    );
}
