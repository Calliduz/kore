import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Product, type OrderItem } from "@/types";

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  userId: string | null;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getOrderItems: () => OrderItem[];
  setUserId: (userId: string | null) => void;
  total: number;
}

// Create a dynamic storage key based on userId
const getStorageKey = (userId: string | null) => `cart-${userId || "guest"}`;

// We need to manage storage dynamically, so we use a custom approach
let currentUserId: string | null = null;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      userId: null,

      setUserId: (userId: string | null) => {
        const prevUserId = currentUserId;
        currentUserId = userId;

        if (prevUserId !== userId) {
          // Load cart for the new user from localStorage
          const storageKey = getStorageKey(userId);
          try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.state) {
                set({
                  items: parsed.state.items || [],
                  total: parsed.state.total || 0,
                  userId,
                });
                return;
              }
            }
          } catch (e) {
            console.warn("Failed to load cart for user:", userId, e);
          }

          // No stored cart for this user, start fresh
          set({ items: [], total: 0, userId });
        }
      },

      addItem: (product: Product) => {
        const items = get().items;
        const productId = product._id || product.id;
        const existingItem = items.find(
          (item: CartItem) => (item._id || item.id) === productId
        );
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

        const newTotal = updatedItems.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
          0
        );

        set({
          items: updatedItems,
          total: newTotal,
        });
      },

      removeItem: (productId: string) => {
        const items = get().items;
        const updatedItems = items.filter(
          (item: CartItem) => (item._id || item.id) !== productId
        );
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
          0
        );

        set({
          items: updatedItems,
          total: newTotal,
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const items = get().items;

        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = items.map((item: CartItem) =>
          (item._id || item.id) === productId ? { ...item, quantity } : item
        );

        const newTotal = updatedItems.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
          0
        );

        set({
          items: updatedItems,
          total: newTotal,
        });
      },

      clearCart: () => set({ items: [], total: 0 }),

      // Format cart items for order creation API
      getOrderItems: () => {
        const items = get().items;
        return items
          .map((item): OrderItem => {
            // Ensure we have valid data for order creation
            const productId = item._id || item.id;
            const productImage =
              item.images?.[0] ||
              item.image ||
              "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=200";

            if (!productId) {
              console.warn("Cart item missing product ID:", item);
            }

            return {
              product: productId || "",
              name: item.name || "Unknown Product",
              qty: item.quantity || 1,
              price: item.price || 0,
              image: productImage,
            };
          })
          .filter((item) => item.product); // Filter out items without product ID
      },
    }),
    {
      name: "cart-guest", // Default storage key
      storage: createJSONStorage(() => ({
        getItem: (_key: string) => {
          // Use dynamic key based on current user
          const dynamicKey = getStorageKey(currentUserId);
          return localStorage.getItem(dynamicKey);
        },
        setItem: (_key: string, value: string) => {
          const dynamicKey = getStorageKey(currentUserId);
          localStorage.setItem(dynamicKey, value);
        },
        removeItem: (_key: string) => {
          const dynamicKey = getStorageKey(currentUserId);
          localStorage.removeItem(dynamicKey);
        },
      })),
    }
  )
);
