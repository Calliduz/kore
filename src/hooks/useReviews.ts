import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type ApiResponse } from "@/types";

// Review types
export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CreateReviewPayload {
  rating: number;
  comment: string;
}

interface ProductReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

// Get reviews for a product
export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID required");
      const { data } = await api.get<ApiResponse<ProductReviewsResponse>>(
        `/products/${productId}/reviews`
      );
      return data.data || { reviews: [], averageRating: 0, totalReviews: 0 };
    },
    enabled: !!productId,
  });
}

// Create a review
export function useCreateReview(productId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      if (!productId) throw new Error("Product ID required");
      const { data } = await api.post<ApiResponse<{ review: Review }>>(
        `/products/${productId}/reviews`,
        payload
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to create review");
      }
      return data.data?.review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

// Check if user can review (has purchased the product)
export function useCanReview(productId: string | undefined) {
  return useQuery({
    queryKey: ["canReview", productId],
    queryFn: async () => {
      if (!productId)
        return { canReview: false, hasPurchased: false, hasReviewed: false };
      const { data } = await api.get<
        ApiResponse<{
          canReview: boolean;
          hasPurchased: boolean;
          hasReviewed: boolean;
        }>
      >(`/products/${productId}/can-review`);
      return (
        data.data || {
          canReview: false,
          hasPurchased: false,
          hasReviewed: false,
        }
      );
    },
    enabled: !!productId,
  });
}
