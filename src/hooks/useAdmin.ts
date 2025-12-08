import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type ApiResponse, type Product, type ProductsResponse } from '@/types';

// Create product payload
interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
}

// Admin: Get all products
export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProductsResponse>>('/products?limit=100');
      return data.data?.data || [];
    },
  });
}

// Admin: Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { data } = await api.post<ApiResponse<{ product: Product }>>('/products', payload);
      if (!data.success) {
        throw new Error(data.message || 'Failed to create product');
      }
      return data.data?.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Admin: Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: CreateProductPayload & { id: string }) => {
      const { data } = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, payload);
      if (!data.success) {
        throw new Error(data.message || 'Failed to update product');
      }
      return data.data?.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Admin: Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/products/${id}`);
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete product');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Admin: Get all orders
export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ orders: any[] }>>('/orders');
      return data.data?.orders || [];
    },
  });
}

// Admin: Update order to delivered
export function useDeliverOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.put<ApiResponse<any>>(`/orders/${orderId}/deliver`);
      if (!data.success) {
        throw new Error(data.message || 'Failed to update delivery status');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}
