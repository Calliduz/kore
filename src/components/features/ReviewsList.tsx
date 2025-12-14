import { useProductReviews, type Review } from "@/hooks/useReviews";
import { Star, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";

interface ReviewsListProps {
  productId: string;
}

export default function ReviewsList({ productId }: ReviewsListProps) {
  const { data, isLoading } = useProductReviews(productId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton circle width={40} height={40} />
              <div>
                <Skeleton width={100} height={16} />
                <Skeleton width={80} height={12} />
              </div>
            </div>
            <Skeleton count={2} />
          </div>
        ))}
      </div>
    );
  }

  const { reviews, averageRating, totalReviews } = data || {
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
        <div className="text-center">
          <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size="lg" />
          <p className="text-sm text-muted-foreground mt-1">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(
              (r: Review) => r.rating === stars
            ).length;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-12 text-right text-muted-foreground">
                  {stars} star
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review: Review) => (
          <div key={review._id} className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {review.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium">
                    {review.user?.name || "Anonymous"}
                  </p>
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>
              <time className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            {review.comment && (
              <p className="text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Star Rating Display Component
export function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}
