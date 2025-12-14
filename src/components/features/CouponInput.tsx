import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useValidateCoupon, type Coupon } from "@/hooks/useCoupons";
import { toast } from "sonner";
import { Tag, Loader2, X, Check } from "lucide-react";

interface CouponInputProps {
  cartTotal: number;
  onApply: (coupon: Coupon | null, discountAmount: number) => void;
  appliedCoupon: Coupon | null;
}

export default function CouponInput({
  cartTotal,
  onApply,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const validateCoupon = useValidateCoupon();

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const result = await validateCoupon.mutateAsync({
        code: code.trim(),
        cartTotal,
      });

      if (result?.valid && result.coupon) {
        onApply(result.coupon, result.discountAmount || 0);
        toast.success(
          `Coupon applied! You save $${(result.discountAmount || 0).toFixed(2)}`
        );
        setCode("");
      } else {
        toast.error(result?.message || "Invalid coupon code");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid coupon code");
    }
  };

  const handleRemove = () => {
    onApply(null, 0);
    toast.info("Coupon removed");
  };

  // Show applied coupon state
  if (appliedCoupon) {
    return (
      <div className="p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium font-mono text-green-700 dark:text-green-300">
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {appliedCoupon.discountType === "percentage"
                  ? `${appliedCoupon.discountValue}% off`
                  : `$${appliedCoupon.discountValue} off`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Have a coupon?
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1 uppercase font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={validateCoupon.isPending || !code.trim()}
        >
          {validateCoupon.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  );
}
