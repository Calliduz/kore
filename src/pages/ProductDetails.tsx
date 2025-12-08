import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type ApiResponse, type Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield } from 'lucide-react';
import { useState } from 'react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // Backend returns { success: true, data: { ...product } } or { success: true, data: product }
      const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return data.data;
    },
  });

  if (isLoading) {
    return (
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
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
        </Button>
      </div>
    );
  }

  const images = data.images?.length ? data.images : [data.image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800'];

  const handleAddToCart = () => {
    addItem(data);
    toast.success(`Added ${data.name} to cart`);
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/" className="hover:text-foreground transition-colors">
          {data.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{data.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-xl overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground/30'
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

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {data.category}
            </span>
            <h1 className="text-4xl font-bold mt-2">{data.name}</h1>
            <p className="text-3xl font-semibold mt-4 text-primary">
              ${data.price.toFixed(2)}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed text-lg">
            {data.description ||
              'A premium product curated for your lifestyle. Designed with quality and functionality in mind.'}
          </p>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {data.stock > 0 ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">
                  {data.stock > 10 ? 'In Stock' : `Only ${data.stock} left`}
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm text-destructive">Out of Stock</span>
              </>
            )}
          </div>

          {/* Add to Cart */}
          <div className="pt-4">
            <Button
              size="lg"
              className="w-full md:w-auto px-12 gap-2"
              onClick={handleAddToCart}
              disabled={data.stock === 0}
            >
              <ShoppingCart className="h-5 w-5" />
              {data.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>

          {/* Features */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Free shipping on orders over $100</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
