import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type ApiResponse, type Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';
import { ShoppingCart, Package, Truck, Shield, Share2, Heart } from 'lucide-react';
import { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 container py-8">
         <Skeleton width={300} height={20} />
         <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
            <Skeleton height={500} className="rounded-xl" />
            <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} width={80} height={80} className="rounded-lg" />
                ))}
            </div>
            </div>
            <div className="space-y-4">
            <Skeleton height={24} width="30%" />
            <Skeleton height={48} width="80%" />
            <Skeleton height={32} width="20%" />
            <Skeleton count={4} />
            <Skeleton height={56} width="100%" />
            </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-24 container">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-3xl font-bold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild size="lg">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = data.images?.length ? data.images : [data.image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800'];

  const handleAddToCart = () => {
    addItem(data);
    toast.success(
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
            <img src={images[0]} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
             <p className="font-medium text-sm">Added to cart</p>
             <p className="text-xs text-muted-foreground line-clamp-1">{data.name}</p>
          </div>
        </div>
      );
  };

  const handleWishlistToggle = () => {
    const productId = data._id || data.id || '';
    if (!productId) return;
    
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        toast.info(
            <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Removed from wishlist</span>
            </div>
        );
    } else {
        addToWishlist(data);
        toast.success(
            <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                <span>Added to wishlist</span>
            </div>
        );
    }
  };

  return (
    <div className="container py-8 space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to="/shop">Shop</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
           <BreadcrumbItem>
            <BreadcrumbLink to={`/shop?category=${data.category}`}>{data.category}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Images Side */}
        <div className="space-y-6">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border shadow-sm relative group">
            <img
              src={images[selectedImage]}
              alt={data.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {data.stock && data.stock < 10 && (
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Low Stock: {data.stock} left
                </div>
            )}
            <button 
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 p-3 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-all hover:scale-110 md:hidden"
            >
                <Heart className={`h-5 w-5 ${isInWishlist(data._id || data.id || '') ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
            </button>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary ring-2 ring-primary/20 ring-offset-2'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${data.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Side */}
        <div className="flex flex-col">
           <div className="mb-6">
                <span className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                {data.category}
                </span>
                 <h1 className="text-4xl md:text-5xl font-bold mt-4 font-heading leading-tight">{data.name}</h1>
                <div className="flex items-baseline gap-4 mt-6">
                    <p className="text-3xl font-bold text-foreground">
                        ${data.price.toFixed(2)}
                    </p>
                    {data.price > 100 && (
                         <span className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                            Free Shipping
                         </span>
                    )}
                </div>
           </div>

            {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              size="lg"
              className="flex-1 py-7 text-lg gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              onClick={handleAddToCart}
              disabled={data.stock === 0}
            >
              <ShoppingCart className="h-5 w-5" />
              {data.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button 
                size="lg" 
                variant="outline" 
                className={`px-6 py-7 hidden md:flex ${isInWishlist(data._id || data.id || '') ? 'border-red-200 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30' : ''}`}
                onClick={handleWishlistToggle}
            >
               <Heart className={`h-5 w-5 ${isInWishlist(data._id || data.id || '') ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="lg" variant="outline" className="px-6 py-7">
               <Share2 className="h-5 w-5" />
            </Button>
          </div>

           {/* Accordions */}
           <Accordion className="mt-8 space-y-2">
                <AccordionItem title="Description" defaultOpen>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                        <p>{data.description || 'Experience premium quality with this meticulously designed product. Crafted for durability and style, it seamlessly integrates into your modern lifestyle.'}</p>
                    </div>
                </AccordionItem>
                <AccordionItem title="Shipping & Returns">
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex gap-3">
                            <Truck className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Fast Delivery</p>
                                <p>Free standard shipping on orders over $100. Expected delivery: 3-5 business days.</p>
                            </div>
                        </div>
                         <div className="flex gap-3">
                            <Shield className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Warranty Protection</p>
                                <p>All products are backed by our 2-year comprehensive warranty against defects.</p>
                            </div>
                        </div>
                    </div>
                </AccordionItem>
                 <AccordionItem title="Details & Specs">
                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                        <li>Premium materials sourced globally</li>
                        <li>Designed in Switzerland</li>
                        <li>Eco-friendly packaging</li>
                        <li>SKU: {data._id || data.id}</li>
                    </ul>
                </AccordionItem>
           </Accordion>
        </div>
      </div>
    </div>
  );
}
