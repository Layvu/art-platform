import { useRef } from 'react';

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import type { Author } from '@/shared/types/payload-types';
import type { Timer } from '@/shared/types/timer.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorQueryOptions } from '@/shared/utils/getDataQueryOptions';

export default function AuthorCard({ name, slug }: Author) {
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
            <CardHeader>
                <CardHeader className="flex flex-1 aspect-square relative items-center">
                    {/* {image ? (
                        <Image
                            alt="Картинка"
                            src={image.url || ''}
                            width={262}
                            height={262}
                            // fill

                            className="object-contain flex-1 "
                            priority
                        />
                    ) : null} */}
                </CardHeader>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                <CardTitle>
                    <Link href={PAGES.AUTHOR(slug!)} className="font-semibold text- hover:underline">
                        {name}
                    </Link>
                </CardTitle>
            </CardContent>
        </Card>
    );
}
