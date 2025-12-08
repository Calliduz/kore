import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type ApiResponse, type ProductsResponse } from '@/types';
import ProductCard from '@/components/features/ProductCard';
import Skeleton from 'react-loading-skeleton';
import { SEO } from '@/components/common/SEO';

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const CATEGORIES = ['Electronics', 'Accessories', 'Home', 'Office', 'Travel'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A-Z', value: 'name_asc' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Filter State
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('category')
  );
  const [priceRange, setPriceRange] = useState(1000);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Sync state with URL
  // Sync URL -> State
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setSelectedCategories(searchParams.getAll('category'));
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Sync debounced search -> URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    // Only update if actually changed
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearch]);

  const updateFilters = (newParams: any) => {
    const params = new URLSearchParams(searchParams);
    
    // Handle Categories
    params.delete('category');
    if (newParams.categories) {
        newParams.categories.forEach((c: string) => params.append('category', c));
    } else {
        selectedCategories.forEach(c => params.append('category', c));
    }

    // Handle Sort
    if (newParams.sort) {
        params.set('sort', newParams.sort);
    }

    // Handle Search (for manual submit)
    if (newParams.search !== undefined) {
        if (newParams.search) params.set('search', newParams.search);
        else params.delete('search');
    } else if (searchInput) {
        params.set('search', searchInput);
    }

    setSearchParams(params);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    updateFilters({ categories: newCategories });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange(1000);
    setSearchInput('');
    setSearchParams({});
  };

  const clearSearch = useCallback(() => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Fetch Products - use debouncedSearch for API calls
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', debouncedSearch, selectedCategories, sortBy], 
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      selectedCategories.forEach(c => params.append('category', c));
      params.append('sort', sortBy);
      
      const { data } = await api.get<ApiResponse<ProductsResponse>>(`/products?${params.toString()}`);
      return data.data?.data || [];
    },
  });

  // Client-side Price Filtering
  const products = Array.isArray(data) ? data : [];
  const filteredProducts = products.filter(product => 
    product.price <= priceRange
  );

    return (
    <div className="container py-8 min-h-screen">
      <SEO 
        title={debouncedSearch ? `Search: ${debouncedSearch}` : 'Shop'} 
        description="Browse our curated collection of premium products. Filter by category, price, and more." 
      />
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {debouncedSearch ? (
                <span>Results for "<span className="text-primary">{debouncedSearch}</span>"</span>
              ) : (
                'Shop'
              )}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              {isFetching && !isLoading && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {filteredProducts?.length || 0} products found
              {selectedCategories.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             {/* Mobile Filter Toggle */}
            <Button 
                variant="outline" 
                className="md:hidden flex-1"
                onClick={() => setIsMobileFiltersOpen(true)}
            >
                <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between">
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem 
                    key={option.value}
                    onClick={() => updateFilters({ sort: option.value })}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex gap-8 items-start">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 space-y-8 sticky top-24">
                {/* Search */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Search</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="Search products..." 
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="pl-9 pr-8"
                      />
                      {searchInput && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Categories</h3>
                    <div className="space-y-2">
                        {CATEGORIES.map(category => (
                            <div key={category} className="flex items-center space-x-2">
                                <input 
                                    type="checkbox"
                                    id={category} 
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryToggle(category)}
                                    className="h-4 w-4 rounded border-primary text-primary focus:ring-1 focus:ring-primary"
                                />
                                <label 
                                    htmlFor={category} 
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                                >
                                    {category}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Max Price</h3>
                        <span className="text-xs text-muted-foreground">${priceRange}</span>
                    </div>
                    <input 
                        type="range"
                        min="0"
                        max="1000" 
                        step="10" 
                        value={priceRange} 
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                 <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={clearFilters}
                >
                    Clear All Filters
                </Button>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                             <div key={i} className="space-y-4">
                                <Skeleton height={200} className="rounded-xl" />
                                <Skeleton width="80%" />
                                <Skeleton width="40%" />
                             </div>
                        ))}
                    </div>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {filteredProducts.map((product) => (
                             <div key={product._id || product.id} className="h-[400px]">
                                <ProductCard product={product} />
                             </div>
                         ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border-2 border-dashed rounded-xl">
                        <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold">No products found</h3>
                        <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
                        <Button onClick={clearFilters}>Clear Filters</Button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="fixed inset-0 bg-black/50 z-50 md:hidden"
                />
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background p-6 shadow-xl md:hidden overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="space-y-8">
                         {/* Categories */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Categories</h3>
                            <div className="space-y-3">
                                {CATEGORIES.map(category => (
                                    <div key={category} className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox"
                                            id={`mobile-${category}`} 
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => handleCategoryToggle(category)}
                                            className="h-5 w-5 rounded border-primary text-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <label 
                                            htmlFor={`mobile-${category}`} 
                                            className="text-lg font-medium leading-none"
                                        >
                                            {category}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Price */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Max Price</h3>
                                <span className="text-sm text-muted-foreground">${priceRange}</span>
                            </div>
                            <input 
                                type="range"
                                min="0"
                                max="1000" 
                                step="10" 
                                value={priceRange} 
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="pt-8 space-y-4">
                            <Button className="w-full" size="lg" onClick={() => setIsMobileFiltersOpen(false)}>
                                Show Results
                            </Button>
                            <Button variant="outline" className="w-full" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}
