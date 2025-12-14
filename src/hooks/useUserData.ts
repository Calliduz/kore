import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  type ApiResponse,
  type SavedAddress,
  type SavedPaymentMethod,
  type AddressesResponse,
  type PaymentMethodsResponse,
} from "@/types";

// ============== ADDRESSES ==============

// Fetch user's saved addresses
export function useAddresses() {
  return useQuery({
    queryKey: ["user", "addresses"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AddressesResponse>>(
        "/users/addresses"
      );
      return data.data?.addresses || [];
    },
  });
}

// Create new address
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<SavedAddress, "_id" | "createdAt">) => {
      const { data } = await api.post<ApiResponse<{ address: SavedAddress }>>(
        "/users/addresses",
        payload
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to create address");
      }
      return data.data?.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}

// Update address
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<SavedAddress> & { id: string }) => {
      const { data } = await api.put<ApiResponse<{ address: SavedAddress }>>(
        `/users/addresses/${id}`,
        payload
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to update address");
      }
      return data.data?.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}

// Delete address
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(
        `/users/addresses/${id}`
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to delete address");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}

// Set default address
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApiResponse<{ address: SavedAddress }>>(
        `/users/addresses/${id}/default`
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to set default address");
      }
      return data.data?.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}

// ============== PAYMENT METHODS ==============

// Fetch user's saved payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: ["user", "paymentMethods"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaymentMethodsResponse>>(
        "/users/payment-methods"
      );
      return data.data?.paymentMethods || [];
    },
  });
}

// Add payment method (via Stripe setup intent)
export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stripePaymentMethodId: string) => {
      const { data } = await api.post<
        ApiResponse<{ paymentMethod: SavedPaymentMethod }>
      >("/users/payment-methods", {
        stripePaymentMethodId,
      });
      if (!data.success) {
        throw new Error(data.message || "Failed to add payment method");
      }
      return data.data?.paymentMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "paymentMethods"] });
    },
  });
}

// Delete payment method
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(
        `/users/payment-methods/${id}`
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to delete payment method");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "paymentMethods"] });
    },
  });
}

// Set default payment method
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<
        ApiResponse<{ paymentMethod: SavedPaymentMethod }>
      >(`/users/payment-methods/${id}/default`);
      if (!data.success) {
        throw new Error(data.message || "Failed to set default payment method");
      }
      return data.data?.paymentMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "paymentMethods"] });
    },
  });
}
