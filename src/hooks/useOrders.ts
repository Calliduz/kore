import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  type ApiResponse,
  type OrderResponse,
  type OrdersResponse,
  type ShippingAddress,
  type OrderItem,
} from '@/types';

// Create order payload
interface CreateOrderPayload {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

// Pay order payload
interface PayOrderPayload {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

// Fetch my orders
export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OrdersResponse>>('/orders/myorders');
      return data.data?.orders || [];
    },
  });
}

// Fetch single order by ID
export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID required');
      const { data } = await api.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`);
      return data.data?.order;
    },
    enabled: !!orderId,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await api.post<ApiResponse<OrderResponse>>('/orders', payload);
      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }
      return data.data?.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Update order to paid
export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, paymentResult }: { orderId: string; paymentResult: PayOrderPayload }) => {
      const { data } = await api.put<ApiResponse<OrderResponse>>(`/orders/${orderId}/pay`, paymentResult);
      if (!data.success) {
        throw new Error(data.message || 'Failed to update payment status');
      }
      return data.data?.order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
    },
  });
}

// Fetch Stripe publishable key
export function useStripeConfig() {
  return useQuery({
    queryKey: ['stripe', 'config'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ publishableKey: string }>>('/config/stripe');
      return data.data?.publishableKey;
    },
    staleTime: Infinity, // Key doesn't change
  });
}

// Create payment intent
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.post<ApiResponse<{ clientSecret: string }>>('/payment/create-payment-intent', {
        orderId,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment intent');
      }
      return data.data?.clientSecret;
    },
  });
}
