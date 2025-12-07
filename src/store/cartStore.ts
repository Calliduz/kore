import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (product: Product) => {
        const items = get().items;
        const existingItem = items.find((item: CartItem) => item.id === product.id);
        let updatedItems;

        if (existingItem) {
          updatedItems = items.map((item: CartItem) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
            updatedItems = [...items, { ...product, quantity: 1 }];
        }
        
        const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

        set({
            items: updatedItems,
            total: newTotal,
        });
      },
      removeItem: (productId: string) => {
           const items = get().items;
           const updatedItems = items.filter((item: CartItem) => item.id !== productId);
           const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
           
           set({ 
               items: updatedItems,
               total: newTotal
            });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
