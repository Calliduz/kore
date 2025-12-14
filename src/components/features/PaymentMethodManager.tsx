import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import {
  usePaymentMethods,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/hooks/useUserData";
import { type SavedPaymentMethod } from "@/types";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Star, Loader2 } from "lucide-react";

interface PaymentMethodManagerProps {
  mode?: "full" | "compact"; // compact mode for checkout selection
  onSelect?: (paymentMethod: SavedPaymentMethod) => void;
  selectedPaymentMethodId?: string;
}

// Card brand icons/colors
const CARD_BRANDS: Record<string, { color: string; label: string }> = {
  visa: { color: "bg-blue-600", label: "Visa" },
  mastercard: { color: "bg-red-500", label: "Mastercard" },
  amex: { color: "bg-blue-800", label: "Amex" },
  discover: { color: "bg-orange-500", label: "Discover" },
  default: { color: "bg-gray-500", label: "Card" },
};

export default function PaymentMethodManager({
  mode = "full",
  onSelect,
  selectedPaymentMethodId,
}: PaymentMethodManagerProps) {
  const { data: paymentMethods, isLoading } = usePaymentMethods();
  const deletePaymentMethod = useDeletePaymentMethod();
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?"))
      return;

    try {
      await deletePaymentMethod.mutateAsync(id);
      toast.success("Payment method removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove payment method");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(id);
      toast.success("Default payment method updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to set default payment method");
    }
  };

  const getCardBrand = (brand: string) => {
    return CARD_BRANDS[brand.toLowerCase()] || CARD_BRANDS.default;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compact mode for checkout
  if (mode === "compact") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Select Payment Method</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add New
          </Button>
        </div>

        {paymentMethods && paymentMethods.length > 0 ? (
          <div className="space-y-2">
            {paymentMethods.map((pm) => {
              const brand = getCardBrand(pm.brand);
              return (
                <button
                  key={pm._id}
                  onClick={() => onSelect?.(pm)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedPaymentMethodId === pm._id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-12 rounded ${brand.color} flex items-center justify-center`}
                    >
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {brand.label} •••• {pm.last4}
                        </span>
                        {pm.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expires {pm.expiryMonth.toString().padStart(2, "0")}/
                        {pm.expiryYear}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No saved payment methods</p>
          </div>
        )}

        {/* Add Payment Modal - Placeholder for Stripe integration */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Payment Method"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Payment methods can be added securely during checkout. Your card
              details will be saved for future purchases.
            </p>
            <Button onClick={() => setIsAddModalOpen(false)} className="w-full">
              Got it
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // Full mode for account page
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <h2 className="font-semibold">Payment Methods</h2>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      {paymentMethods && paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((pm) => {
            const brand = getCardBrand(pm.brand);

            return (
              <div
                key={pm._id}
                className={`p-4 rounded-lg border bg-card flex items-center gap-4 ${
                  pm.isDefault ? "border-primary/50" : ""
                }`}
              >
                <div
                  className={`h-10 w-16 rounded ${brand.color} flex items-center justify-center flex-shrink-0`}
                >
                  <CreditCard className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {brand.label} •••• {pm.last4}
                    </span>
                    {pm.isDefault && (
                      <Star className="h-4 w-4 text-primary fill-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {pm.expiryMonth.toString().padStart(2, "0")}/
                    {pm.expiryYear}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!pm.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(pm._id)}
                      disabled={setDefaultPaymentMethod.isPending}
                      className="text-xs"
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pm._id)}
                    disabled={deletePaymentMethod.isPending}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No saved payment methods</p>
          <p className="text-sm">Add a card for faster checkout</p>
        </div>
      )}

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Payment Method"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Payment methods can be added securely during checkout. Your card
            details will be saved for future purchases.
          </p>
          <Button onClick={() => setIsAddModalOpen(false)} className="w-full">
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  );
}
