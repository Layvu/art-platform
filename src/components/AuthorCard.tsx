import Image from 'next/image';
import Link from 'next/link';

import { PAGES } from '@/config/public-pages.config';
import type { IAuthor } from '@/shared/types/author.interface';

export default function AuthorCard({ id, productsCount, productCategories, name, bio, avatar }: IAuthor) {
    return (
        <div key={id} className="flex flex-col gap-2 border bg-slate-200 p-4 rounded-lg my-4 mx-4">
            <div>id: {id}</div>

            <div>productsCount: {productsCount}</div>
            <div>categories: {productCategories?.join(', ') || '—'}</div>

            <Link href={PAGES.AUTHOR(name)} className="text-blue-500 hover:underline">
                {name}
            </Link>

            {bio ? <p>{bio.slice(0, 100)}</p> : ''}

            {avatar ? <Image alt="Картинка" src={avatar} width={100} height={52} /> : ''}
        </div>
    );
}
