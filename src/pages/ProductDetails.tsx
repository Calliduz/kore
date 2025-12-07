import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type ApiResponse, type Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>();
    const addItem = useCartStore(state => state.addItem);

    const { data, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            // Since we might not have a dedicated single product endpoint or if we do, use it
            // Assuming /products/:id exists or we filter from list if backend is simple
            // Let's assume /products/:id works. If not, we might need to rely on passed state or list fetch.
            // Based on typical express backends:
            const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
            return data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 gap-8">
                <Skeleton height={500} />
                <div className="space-y-4">
                    <Skeleton height={40} width="60%" />
                    <Skeleton height={24} width="40%" />
                    <Skeleton count={3} />
                </div>
            </div>
        );
    }

    if (!data) return <div>Product not found</div>;

    return (
        <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                <img 
                    src={data.image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800'} 
                    alt={data.name} 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="space-y-6">
                <div>
                     <span className="text-sm font-medium text-primary uppercase tracking-wider">{data.category}</span>
                    <h1 className="text-4xl font-bold mt-2">{data.name}</h1>
                    <p className="text-2xl font-semibold mt-4 text-primary">${data.price.toFixed(2)}</p>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                    {data.description || "A premium product curated for your lifestyle. Designed with quality and functionality in mind."}
                </p>

                <div className="pt-6">
                    <Button 
                        size="lg" 
                        className="w-full md:w-auto px-8"
                        onClick={() => {
                            addItem(data);
                            toast.success(`Added ${data.name} to cart`);
                        }}
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}
