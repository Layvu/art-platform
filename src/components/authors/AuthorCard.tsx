'use client';

import { useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { isImageData } from '@/shared/guards/image.guard';
import type { Author } from '@/shared/types/payload-types';
import type { Timer } from '@/shared/types/timer.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorQueryOptions } from '@/shared/utils/getDataQueryOptions';

export default function AuthorCard({ name, slug, avatar }: Author) {
    const timerRef = useRef<Timer | null>(null);
    const queryClient = getQueryClient();

    return (
        <Card
            onMouseEnter={() =>
                (timerRef.current = setTimeout(() => {
                    queryClient.prefetchQuery(getAuthorQueryOptions({ slug: slug! }));
                }, 300))
            }
            onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
        >
            <div className="flex flex-1 aspect-square relative items-center ">
                {avatar ? (
                    <Image
                        alt="Картинка"
                        src={isImageData(avatar) ? (avatar?.url ? avatar.url : '') : ''}
                        fill
                        className="object-cover rounded-md"
                        priority
                    />
                ) : null}
            </div>

            <CardContent className="flex flex-col gap-2">
                <CardTitle>
                    <Link href={PAGES.AUTHOR(slug!)} className="font-semibold hover:underline">
                        {name}
                    </Link>
                </CardTitle>
            </CardContent>
        </Card>
    );
}
