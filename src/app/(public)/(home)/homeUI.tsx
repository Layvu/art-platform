'use client';

import ProductCard from '@/components/ProductCard';
import { PayloadService, payloadService } from '@/services/api/payload-service';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';


export default function HomeUI(){

    const { data } = useSuspenseQuery({
        queryKey: ['products'],
        queryFn: () => payloadService.getProducts(),
    });

    
    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Home</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
};
