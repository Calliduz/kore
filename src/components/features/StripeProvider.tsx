import { useState, useEffect, type ReactNode } from "react";
import { loadStripe, type Stripe, type Appearance } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useStripeConfig } from "@/hooks/useOrders";
import { Loader2 } from "lucide-react";

interface StripeProviderProps {
  children: ReactNode;
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

export default function StripeProvider({ children }: StripeProviderProps) {
  const { data: publishableKey, isLoading, error } = useStripeConfig();
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading payment system...
        </span>
      </div>
    );
  }

  if (error || !publishableKey) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load payment system. Please try again later.</p>
      </div>
    );
  }

  if (!stripePromise) {
    return null;
  }

  // Theme-aware appearance configuration
  const appearance: Appearance = {
    theme: isDarkMode ? "night" : "stripe",
    variables: {
      colorPrimary: "#3b82f6",
      colorBackground: isDarkMode ? "#1a1a1e" : "#ffffff",
      colorText: isDarkMode ? "#f8fafc" : "#0f172a",
      colorTextSecondary: isDarkMode ? "#94a3b8" : "#64748b",
      colorTextPlaceholder: isDarkMode ? "#64748b" : "#94a3b8",
      colorDanger: "#ef4444",
      colorSuccess: "#22c55e",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSizeBase: "16px",
      borderRadius: "8px",
      spacingUnit: "4px",
      focusBoxShadow: "0 0 0 3px rgba(59, 130, 246, 0.35)",
      focusOutline: "none",
    },
    rules: {
      ".Input": {
        border: isDarkMode ? "1px solid #374151" : "1px solid #e2e8f0",
        boxShadow: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      },
      ".Input:focus": {
        border: "1px solid #3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)",
      },
      ".Input:hover": {
        border: isDarkMode ? "1px solid #4b5563" : "1px solid #cbd5e1",
      },
      ".Input--invalid": {
        border: "1px solid #ef4444",
      },
      ".Label": {
        color: isDarkMode ? "#e2e8f0" : "#334155",
        fontWeight: "500",
        marginBottom: "6px",
      },
      ".Error": {
        color: "#ef4444",
        fontSize: "14px",
        marginTop: "6px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ appearance }}>
      {children}
    </Elements>
  );
}
