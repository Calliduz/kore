import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from '@/types';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product) => {
        const items = get().items;
        const productId = product._id || product.id;
        
        if (!items.some(item => (item._id || item.id) === productId)) {
          set({ items: [...items, product] });
        }
      },
      
      removeItem: (productId: string) => {
        set({ 
          items: get().items.filter(item => (item._id || item.id) !== productId) 
        });
      },
      
      isInWishlist: (productId: string) => {
        return get().items.some(item => (item._id || item.id) === productId);
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
