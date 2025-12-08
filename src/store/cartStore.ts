import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product, type OrderItem } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getOrderItems: () => OrderItem[];
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (product: Product) => {
        const items = get().items;
        const productId = product._id || product.id;
        const existingItem = items.find((item: CartItem) => (item._id || item.id) === productId);
        let updatedItems;

        if (existingItem) {
          updatedItems = items.map((item: CartItem) =>
            (item._id || item.id) === productId
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
        const updatedItems = items.filter((item: CartItem) => (item._id || item.id) !== productId);
        const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
        
        set({ 
          items: updatedItems,
          total: newTotal
        });
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        const items = get().items;
        
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const updatedItems = items.map((item: CartItem) =>
          (item._id || item.id) === productId
            ? { ...item, quantity }
            : item
        );
        
        const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
        
        set({
          items: updatedItems,
          total: newTotal,
        });
      },
      
      clearCart: () => set({ items: [], total: 0 }),
      
      // Format cart items for order creation API
      getOrderItems: () => {
        const items = get().items;
        return items.map((item): OrderItem => {
          // Ensure we have valid data for order creation
          const productId = item._id || item.id;
          const productImage = item.images?.[0] || item.image || 'https://via.placeholder.com/150';
          
          if (!productId) {
            console.warn('Cart item missing product ID:', item);
          }
          
          return {
            product: productId || '',
            name: item.name || 'Unknown Product',
            qty: item.quantity || 1,
            price: item.price || 0,
            image: productImage,
          };
        }).filter(item => item.product); // Filter out items without product ID
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

