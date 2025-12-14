import { Link } from "react-router-dom";
import { useMyOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import Skeleton from "react-loading-skeleton";
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  CreditCard,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { SEO } from "@/components/common/SEO";

export default function MyOrders() {
  const { data: orders, isLoading } = useMyOrders();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (order: any) => {
    if (order.isDelivered) {
      return {
        label: "Delivered",
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      };
    }
    if (!order.isPaid) {
      return {
        label: "Awaiting Payment",
        icon: Clock,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      };
    }
    if (order.status === "shipped") {
      return {
        label: "Shipped",
        icon: Truck,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
      };
    }
    return {
      label: "Processing",
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO title="My Orders" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/account"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            {orders?.length || 0} {orders?.length === 1 ? "order" : "orders"}{" "}
            total
          </p>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border bg-card space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton width={120} height={20} />
                  <Skeleton width={80} height={16} />
                </div>
                <Skeleton width={80} height={24} />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton
                    key={j}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusConfig(order);
            const StatusIcon = status.icon;

            return (
              <Link
                key={order._id}
                to={`/order/${order._id}`}
                className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono font-semibold">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${order.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.orderItems?.length}{" "}
                      {order.orderItems?.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.orderItems
                      ?.slice(0, 4)
                      .map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="h-12 w-12 rounded-lg overflow-hidden border-2 border-card bg-muted"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    {order.orderItems?.length > 4 && (
                      <div className="h-12 w-12 rounded-lg bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {order.orderItems
                        ?.map((item: any) => item.name)
                        .join(", ")}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    {!order.isPaid && (
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1"
                        asChild
                      >
                        <span>
                          <CreditCard className="h-3 w-3" />
                          Pay Now
                        </span>
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground border rounded-lg bg-card">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            When you make a purchase, your orders will appear here.
          </p>
          <Button asChild>
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
