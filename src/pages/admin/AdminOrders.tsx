import { useState } from "react";
import {
  useAdminOrders,
  useDeliverOrder,
  useUpdateOrderStatus,
} from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import toast from "@/lib/toast";
import {
  ShoppingBag,
  Loader2,
  Search,
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
} from "lucide-react";
import { type Order } from "@/types";

type OrderStatus =
  | "all"
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered";

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();
  const deliverOrder = useDeliverOrder();
  const updateStatus = useUpdateOrderStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const filteredOrders =
    orders?.filter((order: Order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof order.user === "object" &&
          order.user.email?.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === "pending") matchesStatus = !order.isPaid;
      else if (statusFilter === "paid")
        matchesStatus = order.isPaid && !order.isDelivered;
      else if (statusFilter === "delivered") matchesStatus = order.isDelivered;
      else if (statusFilter === "processing" || statusFilter === "shipped") {
        matchesStatus =
          order.isPaid && !order.isDelivered && order.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    }) || [];

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    try {
      if (status === "delivered") {
        await deliverOrder.mutateAsync(orderId);
        toast.success("Order marked as delivered");
      } else {
        await updateStatus.mutateAsync({ orderId, status });
        toast.success(`Order status updated to ${status}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (order: Order) => {
    if (order.isDelivered) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Delivered
        </span>
      );
    }
    if (!order.isPaid) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending Payment
        </span>
      );
    }
    if (order.status === "shipped") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          Shipped
        </span>
      );
    }
    if (order.status === "processing") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Processing
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Paid
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Orders</h2>
        <p className="text-muted-foreground">
          {orders?.length || 0} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or email..."
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
          className="p-2 border rounded-lg bg-background h-10 min-w-[150px]"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending Payment</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Order</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">
                  Customer
                </th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">
                  Date
                </th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Total</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order: Order) => (
                <tr key={order._id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <p className="font-mono font-medium">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {typeof order.user === "object"
                        ? order.user.email
                        : "Customer"}
                    </p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">
                    {typeof order.user === "object"
                      ? order.user.email
                      : "Customer"}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">{getStatusBadge(order)}</td>
                  <td className="p-4 text-right font-semibold">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {order.isPaid && !order.isDelivered && (
                        <select
                          value={order.status || "processing"}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                          disabled={updatingStatus === order._id}
                          className="p-1 text-xs border rounded bg-background"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchQuery || statusFilter !== "all"
                ? "No orders match your filters"
                : "No orders yet"}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?._id.slice(-8).toUpperCase()}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedOrder)}
                {selectedOrder.isPaid && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Paid{" "}
                    {selectedOrder.paidAt &&
                      `on ${new Date(
                        selectedOrder.paidAt
                      ).toLocaleDateString()}`}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold">
                ${selectedOrder.totalPrice.toFixed(2)}
              </p>
            </div>

            {/* Customer */}
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Details
              </h4>
              <p className="text-sm text-muted-foreground">
                {typeof selectedOrder.user === "object"
                  ? selectedOrder.user.name
                  : "Customer"}
                <br />
                {selectedOrder.shippingAddress?.address}
                <br />
                {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.postalCode}
                <br />
                {selectedOrder.shippingAddress?.country}
              </p>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items ({selectedOrder.orderItems?.length})
              </h4>
              <div className="space-y-2">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded bg-muted/30"
                  >
                    <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.qty} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  $
                  {(
                    selectedOrder.totalPrice -
                    selectedOrder.taxPrice -
                    selectedOrder.shippingPrice
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${selectedOrder.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {selectedOrder.shippingPrice === 0
                    ? "FREE"
                    : `$${selectedOrder.shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>${selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            {selectedOrder.isPaid && !selectedOrder.isDelivered && (
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusUpdate(selectedOrder._id, "processing")
                  }
                  disabled={updatingStatus === selectedOrder._id}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Processing
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusUpdate(selectedOrder._id, "shipped")
                  }
                  disabled={updatingStatus === selectedOrder._id}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Shipped
                </Button>
                <Button
                  onClick={() => {
                    handleStatusUpdate(selectedOrder._id, "delivered");
                    setSelectedOrder(null);
                  }}
                  disabled={updatingStatus === selectedOrder._id}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Delivered
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
