import type { Metadata } from 'next';

type Params = { author: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    return {
        title: (await params).author,
    };
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
    const { author } = await params;

    return <div>Author - {author}</div>;
}
