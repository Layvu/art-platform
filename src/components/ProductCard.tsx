import Link from 'next/link';
import Image from 'next/image';
import { PAGES } from '@/config/public-pages.config';
import type { IProduct } from '@/shared/types/product.interface';

export default function ProductCard({ id, title, description, price, author, image }: IProduct) {
    return (
        <div className="flex flex-col gap-2 border bg-slate-200 p-4 rounded-lg my-4 mx-4">
            <div>{id}</div>
            <Link href={PAGES.PRODUCT(title)} className="text-blue-500 hover:underline">
                {title}
            </Link>
            <p>{description.slice(0, 100)}</p>
            <span>{price}</span>

            <p className="text-sm text-gray-500">
                <Link href={PAGES.AUTHOR(author.name)} className="hover:underline">
                    @{author.name}
                </Link>
            </p>

            {image ? <Image alt="Картинка" src={image} width={100} height={52} /> : ''}
        </div>
    );
}

// TODO: Семантическая вёрстка / tailwind / shadcn
