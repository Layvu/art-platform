import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import ProductUI from '@/components/product/ProductUI';
import { payloadService } from '@/services/api/payload-service';
import type { ProductQueryParams } from '@/shared/types/query-params.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getProductQueryOptions } from '@/shared/utils/getDataQueryOptions';

export async function generateMetadata({ params }: { params: Promise<ProductQueryParams> }): Promise<Metadata> {
    const { product } = await params;

    const productData = await payloadService.getProductBySlug(product);

    if (!productData) {
        return { title: 'Продукт не найден' };
    }

    return {
        title: productData.title,
    };
}

export default async function ProductPage({ params }: { params: Promise<ProductQueryParams> }) {
    const productQueryParams = await params;

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getProductQueryOptions({ slug: productQueryParams.product }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductUI initialParams={productQueryParams} />
        </HydrationBoundary>
    );
}
