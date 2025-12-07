import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { items, total, removeItem, addItem, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Your cart is empty</h2>
          <p className="text-muted-foreground max-w-md">
            Looks like you haven't added anything yet. Start shopping to fill it up!
          </p>
        </div>
        <Link to="/shop">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item: { id: string; name: string; image?: string; category?: string; price: number; quantity: number }) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-4 p-4 border rounded-lg bg-card"
              >
                <div className="h-24 w-24 rounded-md overflow-hidden bg-muted shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=200'}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-primary/80 uppercase tracking-wide font-medium">{item.category}</p>
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 border rounded-md">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            // Decrement logic would go here - for now just remove
                            removeItem(item.id);
                          } else {
                            removeItem(item.id);
                          }
                        }}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-2 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => addItem(item)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-lg p-6 bg-card space-y-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
            <Link to="/shop" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              or Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
