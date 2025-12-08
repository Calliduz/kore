import { Link } from 'react-router-dom';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: any) => {
    addItemToCart(product);
    toast.success(`Added ${product.name} to cart`);
  };

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center space-y-6">
        <div className="flex justify-center">
            <Heart className="h-16 w-16 text-muted-foreground/20" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Save items you love here for later. Continue shopping to find your new favorites.
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link to="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist ({items.length})</h1>
        <Button variant="ghost" asChild>
            <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product._id || product.id} className="group relative border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-all duration-300">
            {/* Image */}
            <div className="aspect-[4/5] bg-muted overflow-hidden relative">
              <Link to={`/product/${product._id || product.id}`}>
                <img
                  src={product.images?.[0] || product.image || 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <button
                onClick={() => {
                    const productId = product._id || product.id || '';
                    if (productId) {
                        removeItem(productId);
                        toast.info('Removed from wishlist');
                    }
                }}
                className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider text-xs">
                    {product.category}
                </p>
                <Link to={`/product/${product._id || product.id}`} className="block mt-1">
                    <h3 className="font-semibold truncate hover:text-primary transition-colors">{product.name}</h3>
                </Link>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="font-medium">${Number(product.price).toFixed(2)}</p>
                <Button size="sm" onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
