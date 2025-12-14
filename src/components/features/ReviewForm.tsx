import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateReview, useCanReview } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Star, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const { user } = useAuth();
  const { data: canReviewData, isLoading: checkingCanReview } =
    useCanReview(productId);
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await createReview.mutateAsync({ rating, comment });
      toast.success("Review submitted successfully!");
      setSubmitted(true);
      setRating(0);
      setComment("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="p-6 rounded-lg border bg-muted/30 text-center">
        <p className="text-muted-foreground mb-3">Sign in to leave a review</p>
        <Button asChild variant="outline">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Loading can review status
  if (checkingCanReview) {
    return (
      <div className="p-6 rounded-lg border bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already reviewed
  if (canReviewData?.hasReviewed || submitted) {
    return (
      <div className="p-6 rounded-lg border bg-green-50 dark:bg-green-900/20 text-center">
        <Check className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
        <p className="font-medium text-green-700 dark:text-green-300">
          Thank you for your review!
        </p>
      </div>
    );
  }

  // Hasn't purchased (optional restriction)
  // Uncomment below if you want to restrict reviews to verified purchases only
  /*
  if (!canReviewData?.hasPurchased) {
    return (
      <div className="p-6 rounded-lg border bg-muted/30 text-center">
        <p className="text-muted-foreground">Purchase this product to leave a review</p>
      </div>
    );
  }
  */

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-lg border bg-card space-y-4"
    >
      <h4 className="font-semibold">Write a Review</h4>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Review (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full p-3 border rounded-lg bg-background min-h-[100px] resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <Button type="submit" disabled={createReview.isPending || rating === 0}>
        {createReview.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
}
