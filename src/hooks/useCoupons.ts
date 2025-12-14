import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type ApiResponse } from "@/types";

// Coupon types
export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface CreateCouponPayload {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  maxUses?: number;
  isActive?: boolean;
  expiresAt?: string | null;
}

interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

// Admin: Get all coupons
export function useAdminCoupons() {
  return useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ coupons: Coupon[] }>>(
        "/coupons"
      );
      return data.data?.coupons || [];
    },
  });
}

// Admin: Create coupon
export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCouponPayload) => {
      const { data } = await api.post<ApiResponse<{ coupon: Coupon }>>(
        "/coupons",
        payload
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to create coupon");
      }
      return data.data?.coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

// Admin: Update coupon
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: CreateCouponPayload & { id: string }) => {
      const { data } = await api.put<ApiResponse<{ coupon: Coupon }>>(
        `/coupons/${id}`,
        payload
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to update coupon");
      }
      return data.data?.coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

// Admin: Delete coupon
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/coupons/${id}`);
      if (!data.success) {
        throw new Error(data.message || "Failed to delete coupon");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

// Customer: Validate coupon
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({
      code,
      cartTotal,
    }: {
      code: string;
      cartTotal: number;
    }) => {
      const { data } = await api.post<ApiResponse<ValidateCouponResponse>>(
        "/coupons/validate",
        {
          code,
          cartTotal,
        }
      );
      if (!data.success) {
        throw new Error(data.message || "Invalid coupon");
      }
      return data.data;
    },
  });
}
