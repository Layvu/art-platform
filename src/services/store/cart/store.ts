import type { Cart, Product } from '@/shared/types/payload-types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
    product: number | Product;
    quantity: number;
    checked?: boolean | null;
    id?: string | null;    
}
interface CartState {
    cart: Cart | null;
    setCart: (cart: Cart) => void;
    addItem: (product: Partial<Product>) => void;
    // increase: (productId: number) => void;
    // decrease: (productId: number) => void;
    // toggleChecked: (productId: number) => void;
    // removeItem: (productId: number) => void;
    // clear: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: { id: 'local', items: [] } as unknown as Cart, 
            // items: [],

            setCart: (cart) => set({ cart }),

            addItem: (product) =>
            set((state) => {
              const cart = state.cart ?? { id: 'local', items: [] }; // защита
              const items = cart.items ?? [];
    
              const exists = items.some((i) =>
                typeof i.product === 'number'
                  ? i.product === product.id
                  : i.product.id === product.id,
              );
    
              if (exists) return state;
    
              const newItems = [
                ...items,
                { product, quantity: 1, checked: true } as CartItem,
              ];
    
              return { cart: { ...cart, items: newItems } as Cart };
            }),

            // increase: (productId) =>
            //   set((state) => ({
            //     items: state.items.map((i) =>
            //       (typeof i.product === 'number' ? i.product : i.product.id) === productId
            //         ? { ...i, quantity: i.quantity + 1 }
            //         : i
            //     ),
            //   })),

            // decrease: (productId) =>
            //   set((state) => ({
            //     items: state.items
            //       .map((i) =>
            //         (typeof i.product === 'number' ? i.product : i.product.id) === productId
            //           ? { ...i, quantity: i.quantity - 1 }
            //           : i
            //       )
            //       .filter((i) => i.quantity > 0),
            //   })),

            // toggleChecked: (productId) =>
            //   set((state) => ({
            //     items: state.items.map((i) =>
            //       (typeof i.product === 'number' ? i.product : i.product.id) === productId
            //         ? { ...i, checked: !i.checked }
            //         : i
            //     ),
            //   })),

            // removeItem: (productId) =>
            //   set((state) => ({
            //     items: state.items.filter(
            //       (i) =>
            //         (typeof i.product === 'number' ? i.product : i.product.id) !== productId
            //     ),
            //   })),

            // clear: () => set({ items: [], cart: null }),
        }),
        { name: 'cart-storage' },
    ),
);
