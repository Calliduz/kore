import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

import { type Product } from '@/types';

interface ProductCardProps {
  product?: Product;
  isLoading?: boolean;
}

export default function ProductCard({ product, isLoading }: ProductCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const addItem = useCartStore((state: { addItem: (p: Product) => void }) => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); 
        if (product) {
            addItem(product);
            toast.success(
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img src={product.images?.[0] || product.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                   <p className="font-medium text-sm">Added to cart</p>
                   <p className="text-xs text-muted-foreground line-clamp-1">{product.name}</p>
                </div>
              </div>
            );
        }
    };

  if (isLoading || !product) {
    return (
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card shadow-sm h-full">
        <Skeleton height={200} className="w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton width="80%" height={24} />
          <Skeleton width="40%" height={20} />
          <Skeleton width="100%" height={40} className="mt-2" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md h-full"
    >
        <div className="relative aspect-square overflow-hidden bg-muted">
             {/* Badges */}
             {product.stock && product.stock < 10 && (
                 <div className="absolute top-2 left-2 z-20 bg-destructive text-destructive-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm rounded-sm">
                     Low Stock
                 </div>
             )}
             
             {/* Skeleton Overlay for Image */}
             {!imageLoaded && (
                <div className="absolute inset-0 z-10">
                     <Skeleton height="100%" containerClassName="h-full w-full" className="h-full w-full" />
                </div>
            )}
            <Link to={`/product/${product._id || product.id}`} className="block h-full w-full cursor-pointer">
                <img
                src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800'}
                alt={product.name}
                loading="lazy"
                className={cn(
                    "h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105",
                    imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800';
                }}
                />
            </Link>
        </div>
        
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div className="space-y-1">
             <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest">{product.category}</p>
             <h3 className="font-heading font-medium tracking-tight text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">{product.name}</h3>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-semibold text-lg text-foreground">${product.price?.toFixed(2) || '0.00'}</span>
        </div>
        
        <div className="mt-auto">
             <Button 
                className="w-full gap-2 items-center active:scale-95 transition-transform" 
                size="sm"
                onClick={handleAddToCart}
             >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
