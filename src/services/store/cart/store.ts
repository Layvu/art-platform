import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { isProductData } from '@/shared/guards/product.guard';
import type { Cart } from '@/shared/types/payload-types';

import { EMPTY_CART } from './utils';

interface CartState {
    cart: Cart | null;
    setCart: (cart: Cart) => void;
    addItem: (productId: number) => void;
    increase: (productId: number) => void;
    decrease: (productId: number) => void;
    toggleChecked: (productId: number) => void;
    removeItem: (productId: number) => void;
    clear: () => void;
    clearCheckedItems: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            cart: EMPTY_CART as Cart,

            setCart: (cart) => set({ cart }),

            addItem: (productId) =>
                set((state) => {
                    const cart = state.cart ?? EMPTY_CART;
                    const items = cart.items ?? [];

                    const exists = items.some((i) => i.product === productId);

                    if (exists) return state;

                    const newItems = [...items, { product: productId, quantity: 1, checked: true }];

                    return { cart: { ...cart, items: newItems } as Cart };
                }),

            increase: (productId) =>
                set((state) => {
                    if (!state.cart) return state;
                    const newItems = state.cart.items?.map((i) => {
                        const id = isProductData(i.product) ? i.product.id : i.product;
                        return id === productId ? { ...i, quantity: i.quantity + 1 } : i;
                    });
                    return { cart: { ...state.cart, items: newItems } };
                }),

            decrease: (productId) =>
                set((state) => {
                    if (!state.cart) return state;
                    const newItems = state.cart.items
                        ?.map((i) => {
                            const id = isProductData(i.product) ? i.product.id : i.product;
                            return id === productId ? { ...i, quantity: i.quantity - 1 } : i;
                        })
                        .filter((i) => i.quantity > 0);
                    return { cart: { ...state.cart, items: newItems } };
                }),

            toggleChecked: (productId) =>
                set((state) => {
                    if (!state.cart) return state;
                    const newItems = state.cart.items?.map((i) => {
                        const id = isProductData(i.product) ? i.product.id : i.product;
                        return id === productId ? { ...i, checked: !i.checked } : i;
                    });
                    return { cart: { ...state.cart, items: newItems } };
                }),

            removeItem: (productId) =>
                set((state) => {
                    if (!state.cart) return state;
                    const newItems = state.cart.items?.filter((i) => {
                        const id = isProductData(i.product) ? i.product.id : i.product;
                        return id !== productId;
                    });
                    return { cart: { ...state.cart, items: newItems } };
                }),

            clear: () => set({ cart: EMPTY_CART as Cart }),

            clearCheckedItems: () => {
                set((state) => {
                    if (!state.cart) return state;

                    return {
                        ...state,
                        cart: {
                            ...state.cart,
                            items: state.cart.items?.filter((item) => !item.checked),
                        },
                    };
                });
            },
        }),
        { name: 'cart-storage' },
    ),
);
