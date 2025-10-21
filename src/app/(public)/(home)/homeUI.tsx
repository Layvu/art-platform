'use client';

import React from 'react';

import ProductCard from '@/components/products/ProductCard';
import { useFetchProducts } from '@/shared/hooks/useFetchData';


export default function HomeUI(){

    const { data } = useFetchProducts({ limit: 10 })
    
    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Home</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.docs?.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
};
