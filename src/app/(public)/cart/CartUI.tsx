'use client';

import { useCartStore } from '@/services/store/cart/store';
import React from 'react';
import { isProductData } from '@/shared/guards/product.guard';

export default function CartUI() {
    const { cart } = useCartStore();

    return (
        <div className="p-4">
            <h1>Cart</h1>
            {cart?.items?.length === 0 && <p>Cart is empty</p>}
            <ul>
                {cart?.items?.map((item) => (
                    <li key={item.id} className="border p-2 mb-2 flex items-center justify-between">
                        <div>
                            <input
                                type="checkbox"
                                checked={item?.checked || false}
                                // onChange={() => toggleCheck(item.id)}
                                className="mr-2"
                            />
                            {isProductData(item.product) && (
                                <>
                                    <span>{item.product?.title ? item.product?.title : 'Unknown'}</span> -{' '}
                                    {item.quantity}
                                </>
                            )}
                        </div>
                        {/* <div>
              <button onClick={() => decrement(item.id)} className="px-2">-</button>
              <button onClick={() => increment(item.id)} className="px-2">+</button>
              <button onClick={() => removeItem(item.id)} className="px-2 text-red-500">x</button>
            </div> */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
