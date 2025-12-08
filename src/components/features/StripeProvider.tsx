import { useState, useEffect, type ReactNode } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useStripeConfig } from '@/hooks/useOrders';
import { Loader2 } from 'lucide-react';

interface StripeProviderProps {
  children: ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const { data: publishableKey, isLoading, error } = useStripeConfig();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading payment system...</span>
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

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
