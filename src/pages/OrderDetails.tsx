import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Skeleton from "react-loading-skeleton";
import {
  Package,
  Truck,
  CreditCard,
  CheckCircle,
  Clock,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { SEO } from "@/components/common/SEO";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading, error } = useOrder(id);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO title={`Order #${orderNumber}`} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/account")}
            className="gap-2 mb-2 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Account
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
      </div>

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
              <Button asChild variant="outline" className="w-full">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
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
