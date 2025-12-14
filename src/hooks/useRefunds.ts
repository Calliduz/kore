import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  type ApiResponse,
  type RefundRequest,
  type RefundReason,
  type RefundsResponse,
} from "@/types";

// ============== USER REFUNDS ==============

// Request refund for an order
export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
      description,
      items,
    }: {
      orderId: string;
      reason: RefundReason;
      description?: string;
      items?: { product: string; qty: number }[];
    }) => {
      const { data } = await api.post<ApiResponse<{ refund: RefundRequest }>>(
        `/orders/${orderId}/refund`,
        {
          reason,
          description,
          items,
        }
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to request refund");
      }
      return data.data?.refund;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["user", "refunds"] });
    },
  });
}

// Get refund status for an order
export function useOrderRefund(orderId: string | undefined) {
  return useQuery({
    queryKey: ["orders", orderId, "refund"],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID required");
      const { data } = await api.get<ApiResponse<{ refund: RefundRequest }>>(
        `/orders/${orderId}/refund`
      );
      return data.data?.refund;
    },
    enabled: !!orderId,
  });
}

// Get all user's refund requests
export function useUserRefunds() {
  return useQuery({
    queryKey: ["user", "refunds"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefundsResponse>>(
        "/users/refunds"
      );
      return data.data?.refunds || [];
    },
  });
}

// ============== ADMIN REFUNDS ==============

// Get all refund requests (admin)
export function useAdminRefunds() {
  return useQuery({
    queryKey: ["admin", "refunds"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefundsResponse>>(
        "/admin/refunds"
      );
      return data.data?.refunds || [];
    },
  });
}

// Update refund status (admin)
export function useUpdateRefundStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      refundId,
      status,
      adminNotes,
    }: {
      refundId: string;
      status: "approved" | "rejected" | "processed";
      adminNotes?: string;
    }) => {
      const { data } = await api.put<ApiResponse<{ refund: RefundRequest }>>(
        `/admin/refunds/${refundId}`,
        {
          status,
          adminNotes,
        }
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to update refund status");
      }
      return data.data?.refund;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
      queryClient.invalidateQueries({ queryKey: ["user", "refunds"] });
    },
  });
}
