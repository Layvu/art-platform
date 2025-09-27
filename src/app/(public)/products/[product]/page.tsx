import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
        <Card className="max-w-[800px] mx-auto mt-8">
            <CardHeader>
                <div className="flex items-center gap-4">
                    {image && <Image src={image} alt={title} width={48} height={48} />}
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="text-sm text-gray-500">Id: {id}</p>
                        <p className="text-sm text-gray-500">Slug: {slug}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {description && <p>{description.slice(0, 100)}</p>}
                <span>Цена: {price}</span>
            </CardContent>

            <CardFooter>
                <p className="text-sm text-gray-500">
                    <Link href={PAGES.AUTHOR(author.slug)} className="hover:underline text-blue-500">
                        @{author.name}
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
