import type { Metadata } from 'next';

type Params = { product: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    return {
        title: (await params).product,
    };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
    const { product } = await params;

    return <div>Product - {product}</div>;
}
