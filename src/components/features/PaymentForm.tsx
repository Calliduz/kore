import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useCreatePaymentIntent, usePayOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';
import { Loader2, CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
  orderId: string;
  totalPrice: number;
  userEmail: string;
  onSuccess: () => void;
}

export default function PaymentForm({ orderId, totalPrice, userEmail, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const createPaymentIntent = useCreatePaymentIntent();
  const payOrder = usePayOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create PaymentIntent on backend
      const clientSecret = await createPaymentIntent.mutateAsync(orderId);
      
      if (!clientSecret) {
        throw new Error('Failed to get payment secret');
      }

      // 2. Confirm card payment with Stripe
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
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

        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Card Information</span>
        </div>
        
        <div className="p-4 border rounded-lg bg-card">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'hsl(var(--color-foreground))',
                  '::placeholder': {
                    color: 'hsl(var(--color-muted-foreground))',
                  },
                },
                invalid: {
                  color: 'hsl(var(--color-destructive))',
                },
              },
            }}
          />
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${totalPrice.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}
