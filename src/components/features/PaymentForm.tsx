import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { StripeCardElementChangeEvent } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { useCreatePaymentIntent, usePayOrder } from "@/hooks/useOrders";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface PaymentFormProps {
  orderId: string;
  totalPrice: number;
  userEmail: string;
  onSuccess: () => void;
}

// Check if dark mode is active
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function PaymentForm({
  orderId,
  totalPrice,
  userEmail,
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isDarkMode = useIsDarkMode();

  const createPaymentIntent = useCreatePaymentIntent();
  const payOrder = usePayOrder();

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    setCardError(event.error?.message || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment system not ready");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card element not found");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create PaymentIntent on backend
      const clientSecret = await createPaymentIntent.mutateAsync(orderId);

      if (!clientSecret) {
        throw new Error("Failed to get payment secret");
      }

      // 2. Confirm card payment with Stripe
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (paymentIntent?.status === "succeeded") {
        // 3. Update order as paid on backend
        await payOrder.mutateAsync({
          orderId,
          paymentResult: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: userEmail,
          },
        });

        toast.success("Payment successful!");
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Card element styling - uses actual color values, not CSS variables (Stripe can't read them)
  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        fontSmoothing: "antialiased",
        color: isDarkMode ? "#f8fafc" : "#0f172a",
        iconColor: isDarkMode ? "#94a3b8" : "#64748b",
        "::placeholder": {
          color: isDarkMode ? "#64748b" : "#94a3b8",
        },
        ":-webkit-autofill": {
          color: isDarkMode ? "#f8fafc" : "#0f172a",
        },
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
      },
      complete: {
        color: isDarkMode ? "#22c55e" : "#16a34a",
        iconColor: isDarkMode ? "#22c55e" : "#16a34a",
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Input Section */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CreditCard className="h-4 w-4 text-primary" />
          Card Details
        </label>

        {/* Card Element Container */}
        <div
          className={`
            relative p-4 rounded-xl transition-all duration-200
            ${
              isDarkMode
                ? "bg-slate-900/50 border-slate-700"
                : "bg-slate-50/50 border-slate-200"
            }
            border-2
            ${
              isFocused
                ? "border-primary ring-2 ring-primary/20"
                : cardError
                ? "border-red-500"
                : cardComplete
                ? "border-green-500"
                : ""
            }
          `}
        >
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Status indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {cardComplete && !cardError && (
              <CheckCircle2 className="h-5 w-5 text-green-500 animate-in fade-in zoom-in duration-200" />
            )}
          </div>
        </div>

        {/* Error message */}
        {cardError && (
          <div className="flex items-center gap-2 text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{cardError}</span>
          </div>
        )}

        {/* Test card hint */}
        <div
          className={`
          p-3 rounded-lg text-xs
          ${
            isDarkMode
              ? "bg-blue-950/30 border border-blue-800/50 text-blue-300"
              : "bg-blue-50/50 border border-blue-200 text-blue-700"
          }
        `}
        >
          <p className="font-medium mb-1">Test Mode</p>
          <p className="opacity-80">
            Use card: 4242 4242 4242 4242, any future date, any CVC
          </p>
        </div>
      </div>

      {/* Security Badges */}
      <div
        className={`
        flex flex-wrap items-center justify-center gap-4 py-3 rounded-lg
        ${isDarkMode ? "bg-slate-800/30" : "bg-slate-100/50"}
      `}
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>256-bit SSL</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>PCI Compliant</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-auto" viewBox="0 0 60 25" fill="none">
            <path
              d="M7.5 25c4.142 0 7.5-5.596 7.5-12.5S11.642 0 7.5 0 0 5.596 0 12.5 3.358 25 7.5 25z"
              className="fill-current text-muted-foreground/50"
            />
            <path
              d="M22.5 25c4.142 0 7.5-5.596 7.5-12.5S26.642 0 22.5 0 15 5.596 15 12.5 18.358 25 22.5 25z"
              className="fill-current text-muted-foreground/50"
            />
          </svg>
        </div>
      </div>

      {/* Pay Button */}
      <Button
        type="submit"
        className={`
          w-full h-12 text-base font-semibold transition-all duration-200
          ${
            cardComplete && !cardError
              ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              : ""
          }
        `}
        size="lg"
        disabled={!stripe || isProcessing || !cardComplete}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Payment...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Pay ${totalPrice.toFixed(2)}
          </span>
        )}
      </Button>

      {/* Trust footer */}
      <p className="text-center text-xs text-muted-foreground">
        Payments are processed securely by{" "}
        <span className="font-medium text-foreground/80">Stripe</span>
      </p>
    </form>
  );
}
