import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  ShoppingBag,
  Truck,
  CreditCard,
  ChevronRight,
  Check,
  Plus,
  MapPin,
} from "lucide-react";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses } from "@/hooks/useUserData";
import StripeProvider from "@/components/features/StripeProvider";
import PaymentForm from "@/components/features/PaymentForm";
import CouponInput from "@/components/features/CouponInput";
import { type Coupon } from "@/hooks/useCoupons";
import { type SavedAddress } from "@/types";

const shippingSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

type CheckoutStep = "shipping" | "payment" | "confirmation";

export default function Checkout() {
  const { items, total, clearCart, getOrderItems } = useCartStore();
  const { user } = useAuth();
  const { data: savedAddresses, isLoading: addressesLoading } = useAddresses();
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingFormData | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  // Set default address when addresses load
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr =
        savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr._id);
    } else if (savedAddresses && savedAddresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses, selectedAddressId]);

  // Redirect if cart is empty and not in confirmation step
  useEffect(() => {
    if (items.length === 0 && step !== "confirmation") {
      navigate("/cart");
      toast.error("Your cart is empty");
    }
  }, [items, navigate, step]);

  // Handle coupon application
  const handleCouponApply = (coupon: Coupon | null, discount: number) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
  };

  // Calculate prices
  const TAX_RATE = 0.08; // 8% tax
  const SHIPPING_COST = total > 100 ? 0 : 10; // Free shipping over $100
  const subtotalAfterDiscount = Math.max(0, total - discountAmount);
  const taxPrice = Number((subtotalAfterDiscount * TAX_RATE).toFixed(2));
  const shippingPrice = SHIPPING_COST;
  const totalPrice = Number(
    (subtotalAfterDiscount + taxPrice + shippingPrice).toFixed(2)
  );

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address._id);
    setShowNewAddressForm(false);
  };

  const onShippingSubmit = async (data: ShippingFormData) => {
    await submitOrder(data);
  };

  const handleContinueWithSavedAddress = async () => {
    if (!selectedAddressId || !savedAddresses) return;

    const selected = savedAddresses.find((a) => a._id === selectedAddressId);
    if (!selected) {
      toast.error("Please select an address");
      return;
    }

    const addressData: ShippingFormData = {
      address: selected.address,
      city: selected.city,
      postalCode: selected.postalCode,
      country: selected.country,
    };

    await submitOrder(addressData);
  };

  const submitOrder = async (data: ShippingFormData) => {
    try {
      // Create order
      const order = await createOrder.mutateAsync({
        orderItems: getOrderItems(),
        shippingAddress: data,
        paymentMethod: "stripe",
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      if (order?._id) {
        setOrderId(order._id);
        setShippingAddress(data);
        setStep("payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setStep("confirmation");
  };

  if (items.length === 0 && step !== "confirmation") return null;

  const hasSavedAddresses = savedAddresses && savedAddresses.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        <StepIndicator
          step={1}
          label="Shipping"
          isActive={step === "shipping"}
          isComplete={step === "payment" || step === "confirmation"}
        />
        <div className="w-16 h-0.5 bg-muted mx-2" />
        <StepIndicator
          step={2}
          label="Payment"
          isActive={step === "payment"}
          isComplete={step === "confirmation"}
        />
        <div className="w-16 h-0.5 bg-muted mx-2" />
        <StepIndicator
          step={3}
          label="Confirm"
          isActive={step === "confirmation"}
          isComplete={false}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === "shipping" && (
            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>

              {/* Saved Addresses */}
              {!addressesLoading &&
                hasSavedAddresses &&
                !showNewAddressForm && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select a saved address or add a new one:
                    </p>

                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            selectedAddressId === addr._id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-primary">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-medium">{addr.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.city}, {addr.postalCode}, {addr.country}
                          </p>
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowNewAddressForm(true)}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Use a Different Address
                    </Button>

                    <Button
                      className="w-full mt-4"
                      size="lg"
                      disabled={!selectedAddressId || createOrder.isPending}
                      onClick={handleContinueWithSavedAddress}
                    >
                      {createOrder.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          Continue to Payment
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

              {/* New Address Form */}
              {(showNewAddressForm ||
                (!addressesLoading && !hasSavedAddresses)) && (
                <>
                  {hasSavedAddresses && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewAddressForm(false)}
                      className="mb-4 -ml-2"
                    >
                      ← Back to saved addresses
                    </Button>
                  )}

                  <form
                    onSubmit={handleSubmit(onShippingSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Address
                      </label>
                      <input
                        {...register("address")}
                        placeholder="123 Main Street"
                        className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.address && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          City
                        </label>
                        <input
                          {...register("city")}
                          placeholder="New York"
                          className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {errors.city && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Postal Code
                        </label>
                        <input
                          {...register("postalCode")}
                          placeholder="10001"
                          className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {errors.postalCode && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Country
                      </label>
                      <input
                        {...register("country")}
                        placeholder="USA"
                        className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.country && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.country.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-6"
                      size="lg"
                      disabled={isSubmitting || createOrder.isPending}
                    >
                      {isSubmitting || createOrder.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          Continue to Payment
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {/* Loading state */}
              {addressesLoading && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading addresses...
                  </p>
                </div>
              )}
            </div>
          )}

          {step === "payment" && orderId && (
            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Payment</h2>
              </div>

              {shippingAddress && (
                <div className="mb-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">
                    Shipping to:
                  </p>
                  <p className="font-medium">
                    {shippingAddress.address}, {shippingAddress.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shippingAddress.postalCode}, {shippingAddress.country}
                  </p>
                </div>
              )}

              <StripeProvider>
                <PaymentForm
                  orderId={orderId}
                  totalPrice={totalPrice}
                  userEmail={user?.email || ""}
                  onSuccess={handlePaymentSuccess}
                />
              </StripeProvider>
            </div>
          )}

          {step === "confirmation" && (
            <div className="p-6 rounded-lg border bg-card text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. Your order has been placed
                successfully.
              </p>

              {orderId && (
                <p className="text-sm text-muted-foreground mb-6">
                  Order ID: <span className="font-mono">{orderId}</span>
                </p>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/orders")}>
                  View Orders
                </Button>
                <Button onClick={() => navigate("/")}>Continue Shopping</Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-lg border bg-card sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item._id || item.id || `checkout-item-${index}`}
                  className="flex gap-3"
                >
                  <div className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.images?.[0] || item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Input - Only show during shipping step */}
            {step === "shipping" && (
              <div className="border-t mt-6 pt-4">
                <CouponInput
                  cartTotal={total}
                  onApply={handleCouponApply}
                  appliedCoupon={appliedCoupon}
                />
              </div>
            )}

            <div className="border-t mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingPrice === 0
                    ? "FREE"
                    : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {total < 100 && step === "shipping" && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 text-sm">
                <p className="text-primary">
                  Add ${(100 - total).toFixed(2)} more for free shipping!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step indicator component
function StepIndicator({
  step,
  label,
  isActive,
  isComplete,
}: {
  step: number;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
          ${isComplete ? "bg-primary text-primary-foreground" : ""}
          ${isActive ? "bg-primary text-primary-foreground" : ""}
          ${!isActive && !isComplete ? "bg-muted text-muted-foreground" : ""}
        `}
      >
        {isComplete ? <Check className="h-4 w-4" /> : step}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${
          isActive || isComplete ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
