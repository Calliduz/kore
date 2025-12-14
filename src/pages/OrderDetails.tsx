import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useOrderRefund } from "@/hooks/useRefunds";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Receipt from "@/components/features/Receipt";
import RefundRequestModal from "@/components/features/RefundRequestModal";
import StripeProvider from "@/components/features/StripeProvider";
import PaymentForm from "@/components/features/PaymentForm";
import Skeleton from "react-loading-skeleton";
import {
  Package,
  Truck,
  CreditCard,
  CheckCircle,
  Clock,
  MapPin,
  ChevronLeft,
  Printer,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { toast } from "sonner";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const { data: refundRequest } = useOrderRefund(id);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    refetch();
    toast.success("Payment completed successfully!");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton width={200} height={32} />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton height={200} className="rounded-lg" />
            <Skeleton height={150} className="rounded-lg" />
          </div>
          <div>
            <Skeleton height={300} className="rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The order you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Button onClick={() => navigate("/account")}>Back to Account</Button>
      </div>
    );
  }

  const orderNumber = order._id.slice(-8).toUpperCase();
  const canRequestRefund = order.isPaid && order.isDelivered && !refundRequest;
  const hasRefundRequest = !!refundRequest;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO title={`Order #${orderNumber}`} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="gap-2 mb-2 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Order #{orderNumber}
          </h1>
          <p className="text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex gap-2">
          {order.isPaid && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReceiptModal(true)}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Refund Status Banner */}
      {hasRefundRequest && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            refundRequest.status === "pending"
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
              : refundRequest.status === "approved" ||
                refundRequest.status === "processed"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          <AlertCircle
            className={`h-5 w-5 ${
              refundRequest.status === "pending"
                ? "text-yellow-600"
                : refundRequest.status === "approved" ||
                  refundRequest.status === "processed"
                ? "text-green-600"
                : "text-red-600"
            }`}
          />
          <div>
            <p className="font-medium">
              Refund Request:{" "}
              <span className="capitalize">{refundRequest.status}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {refundRequest.status === "pending" &&
                "Your refund request is being reviewed."}
              {refundRequest.status === "approved" &&
                "Your refund has been approved and will be processed soon."}
              {refundRequest.status === "processed" &&
                `Refund of $${refundRequest.totalRefundAmount.toFixed(
                  2
                )} has been processed.`}
              {refundRequest.status === "rejected" &&
                "Your refund request was not approved."}
            </p>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="p-6 rounded-lg border bg-card">
        <h2 className="font-semibold mb-4">Order Status</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-muted -z-10" />

          {/* Order Placed */}
          <StatusStep
            icon={Package}
            label="Order Placed"
            date={order.createdAt}
            isComplete={true}
            isActive={!order.isPaid}
          />

          {/* Payment */}
          <StatusStep
            icon={CreditCard}
            label="Payment"
            date={order.paidAt}
            isComplete={order.isPaid}
            isActive={order.isPaid && !order.isDelivered}
          />

          {/* Delivered */}
          <StatusStep
            icon={Truck}
            label="Delivered"
            date={order.deliveredAt}
            isComplete={order.isDelivered}
            isActive={false}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-3 rounded-lg bg-muted/30"
                >
                  <div className="h-20 w-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quantity: {item.qty}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Shipping Address</h2>
            </div>
            <div className="text-muted-foreground">
              <p className="font-medium text-foreground">{user?.name}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg border bg-card sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  $
                  {(
                    order.totalPrice -
                    order.taxPrice -
                    order.shippingPrice
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shippingPrice === 0
                    ? "FREE"
                    : `$${order.shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-6 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {order.isPaid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        Paid
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.paidAt &&
                          new Date(order.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">
                        Awaiting Payment
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Delivery Status */}
            <div className="mt-3 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {order.isDelivered ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        Delivered
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.deliveredAt &&
                          new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        {order.isPaid ? "In Transit" : "Pending"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              {/* Pay Now Button - for unpaid orders */}
              {!order.isPaid && (
                <Button
                  className="w-full gap-2"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <CreditCard className="h-4 w-4" />
                  Pay Now - ${order.totalPrice.toFixed(2)}
                </Button>
              )}

              {/* Request Refund Button - for delivered, paid orders without existing refund */}
              {canRequestRefund && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowRefundModal(true)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Request Refund
                </Button>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Complete Payment"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Order Total</p>
            <p className="text-2xl font-bold">${order.totalPrice.toFixed(2)}</p>
          </div>
          <StripeProvider>
            <PaymentForm
              orderId={order._id}
              totalPrice={order.totalPrice}
              userEmail={user?.email || ""}
              onSuccess={handlePaymentSuccess}
            />
          </StripeProvider>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Order Receipt"
        size="lg"
      >
        <Receipt order={order} userName={user?.name} />
      </Modal>

      {/* Refund Modal */}
      <RefundRequestModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        order={order}
      />
    </div>
  );
}

// Status Step Component
function StatusStep({
  icon: Icon,
  label,
  date,
  isComplete,
  isActive,
}: {
  icon: any;
  label: string;
  date?: string;
  isComplete: boolean;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center z-10">
      <div
        className={`
        h-10 w-10 rounded-full flex items-center justify-center transition-colors
        ${isComplete ? "bg-green-500 text-white" : ""}
        ${isActive ? "bg-primary text-primary-foreground" : ""}
        ${!isComplete && !isActive ? "bg-muted text-muted-foreground" : ""}
      `}
      >
        {isComplete ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      <p
        className={`text-sm font-medium mt-2 ${
          isComplete || isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      {date && (
        <p className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
