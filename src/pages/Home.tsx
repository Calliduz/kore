import ProductCard from '@/components/features/ProductCard';
import Hero from '@/components/features/Hero';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type ApiResponse, type Product } from '@/types';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

// Fetch function
const fetchProducts = async ({ pageParam = undefined }: { pageParam?: string }) => {
    const cursor = pageParam ? `?cursor=${pageParam}` : '';
    const { data } = await api.get<ApiResponse<Product[]>>(`/products${cursor}`);
    return data;
};

export default function Home() {
    const { ref, inView } = useInView();
    
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
        initialPageParam: undefined,
        getNextPageParam: (lastPage: ApiResponse<Product[]>) => lastPage.meta?.nextCursor,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten pages for rendering
  const products = data?.pages.flatMap((page: ApiResponse<Product[]>) => page.data || []) || [];

  return (
    <div className="space-y-12">
      <Hero />
      
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
               Array.from({ length: 8 }).map((_, i) => (
                  <ProductCard key={i} isLoading={true} />
              ))
          ) : (
              <>
                  {products.map((product: Product, index: number) => (
                      <ProductCard key={`${product.id}-${index}`} product={product} />
                  ))}
                   {isFetchingNextPage && Array.from({ length: 4 }).map((_, i) => (
                       <ProductCard key={`loading-${i}`} isLoading={true} />
                   ))}
                   <div ref={ref} className="h-4 w-full col-span-full" />
              </>
          )}
        </div>
      </section>
    </div>
  );
}
