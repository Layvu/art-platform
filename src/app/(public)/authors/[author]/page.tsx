import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
        <Card className="max-w-[800px] mx-auto mt-8">
            <CardHeader>
                <div className="flex items-center gap-4">
                    {avatar && <Image src={avatar} alt={name} width={48} height={48} />}
                    <div>
                        <h2 className="text-lg font-semibold">{name}</h2>
                        <p className="text-sm text-gray-500">Id: {id}</p>
                        <p className="text-sm text-gray-500">Slug: {slug}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {bio && <p>{bio.slice(0, 100)}</p>}
                <span>Общее количество товаров: {productsCount}</span>
                <span>Категории товаров: {productCategories?.join(', ') || '—'}</span>
            </CardContent>
        </Card>
    );
}
