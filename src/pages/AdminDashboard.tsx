import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdminOrders,
  useDeliverOrder,
} from "@/hooks/useAdmin";
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/hooks/useCoupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  LayoutDashboard,
  ShoppingBag,
  X,
  DollarSign,
  TrendingUp,
  Tag,
  Truck,
  Eye,
  Percent,
} from "lucide-react";
import { type Product, type Order } from "@/types";

// Types for admin
interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

type TabType = "overview" | "products" | "orders" | "coupons";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Redirect non-admins
  if (user?.role !== "admin") {
    return (
      <div className="text-center py-16">
        <LayoutDashboard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You need admin privileges to access this page.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your store products, orders, and promotions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto pb-px">
        {[
          {
            id: "overview" as TabType,
            label: "Overview",
            icon: LayoutDashboard,
          },
          { id: "products" as TabType, label: "Products", icon: Package },
          { id: "orders" as TabType, label: "Orders", icon: ShoppingBag },
          { id: "coupons" as TabType, label: "Coupons", icon: Tag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "coupons" && <CouponsTab />}
    </div>
  );
}

// ==================== OVERVIEW TAB ====================
function OverviewTab() {
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();

  const isLoading = productsLoading || ordersLoading;

  // Calculate stats
  const totalRevenue =
    orders?.reduce(
      (sum: number, order: Order) =>
        order.isPaid ? sum + order.totalPrice : sum,
      0
    ) || 0;
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter((o: Order) => o.isPaid).length || 0;
  const pendingOrders =
    orders?.filter((o: Order) => !o.isDelivered && o.isPaid).length || 0;
  const totalProducts = products?.length || 0;
  const lowStockProducts =
    products?.filter((p: Product) => p.stock < 10).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          subtitle={`From ${paidOrders} paid orders`}
          icon={DollarSign}
          iconColor="text-green-500"
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          subtitle={`${pendingOrders} pending delivery`}
          icon={ShoppingBag}
          iconColor="text-blue-500"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Products"
          value={totalProducts.toString()}
          subtitle={`${lowStockProducts} low stock`}
          icon={Package}
          iconColor="text-purple-500"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          title="Conversion"
          value={
            totalOrders > 0
              ? `${((paidOrders / totalOrders) * 100).toFixed(0)}%`
              : "0%"
          }
          subtitle="Payment success rate"
          icon={TrendingUp}
          iconColor="text-orange-500"
          iconBg="bg-orange-100 dark:bg-orange-900/30"
        />
      </div>

      {/* Recent Orders */}
      <div className="p-6 rounded-lg border bg-card">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {orders?.slice(0, 5).map((order: Order) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div>
                <p className="font-mono text-sm">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {typeof order.user === "object"
                    ? order.user.email
                    : "Customer"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${order.totalPrice.toFixed(2)}</p>
                <StatusBadge
                  isPaid={order.isPaid}
                  isDelivered={order.isDelivered}
                />
              </div>
            </div>
          ))}
          {(!orders || orders.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              No orders yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div
          className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  isPaid,
  isDelivered,
}: {
  isPaid: boolean;
  isDelivered: boolean;
}) {
  if (isDelivered) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Delivered
      </span>
    );
  }
  if (isPaid) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Paid
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
      Pending
    </span>
  );
}

// ==================== PRODUCTS TAB ====================
function ProductsTab() {
  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Products ({products?.length || 0})
        </h2>
        <Button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showAddProduct && (
        <ProductForm
          onSuccess={() => setShowAddProduct(false)}
          onCancel={() => setShowAddProduct(false)}
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSuccess={() => setEditingProduct(null)}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products?.map((product: Product, index: number) => {
                const productId = product._id || product.id;
                return (
                  <tr
                    key={productId || `product-${index}`}
                    className="hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={
                              product.images?.[0] ||
                              product.image ||
                              "https://via.placeholder.com/100"
                            }
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="p-4">${product.price?.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : product.stock > 0
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            productId && handleDelete(productId, product.name)
                          }
                          disabled={deleteProduct.isPending || !productId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!products || products.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products yet. Add your first product!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Form (Create/Edit)
function ProductForm({
  product,
  onSuccess,
  onCancel,
}: {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category: product?.category || "",
    stock: product?.stock?.toString() || "10",
    images: product?.images?.join(", ") || product?.image || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.category ||
      !formData.price ||
      !formData.images
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        images: formData.images
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
      };

      if (product) {
        await updateProduct.mutateAsync({
          id: product._id || product.id || "",
          ...payload,
        });
        toast.success("Product updated successfully");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Product created successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.message || `Failed to ${product ? "update" : "create"} product`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["Electronics", "Accessories", "Home", "Office", "Travel"];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {product ? "Edit Product" : "Add New Product"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-background h-10"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price ($) *</label>
          <Input
            name="price"
            value={formData.price}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="29.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock *</label>
          <Input
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            type="number"
            placeholder="10"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-background min-h-[80px]"
            placeholder="Product description..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Image URLs *</label>
          <Input
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate multiple URLs with commas
          </p>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {product ? "Updating..." : "Creating..."}
              </>
            ) : product ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ==================== ORDERS TAB ====================
function OrdersTab() {
  const { data: orders, isLoading } = useAdminOrders();
  const deliverOrder = useDeliverOrder();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const handleMarkDelivered = async (orderId: string) => {
    if (!confirm("Mark this order as delivered?")) return;

    try {
      await deliverOrder.mutateAsync(orderId);
      toast.success("Order marked as delivered");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
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
      <h2 className="text-xl font-semibold">
        All Orders ({orders?.length || 0})
      </h2>

      <div className="space-y-4">
        {orders?.map((order: Order) => (
          <div
            key={order._id}
            className="border rounded-lg bg-card overflow-hidden"
          >
            {/* Order Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() =>
                setExpandedOrder(expandedOrder === order._id ? null : order._id)
              }
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-mono font-medium">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {typeof order.user === "object"
                      ? order.user.email
                      : "Customer"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.isPaid
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.isDelivered
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {order.isDelivered ? "Delivered" : "Processing"}
                  </span>
                </div>

                <Eye
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    expandedOrder === order._id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Order Details (Expanded) */}
            {expandedOrder === order._id && (
              <div className="border-t p-4 bg-muted/20 space-y-4">
                {/* Items */}
                <div>
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.orderItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded bg-background"
                      >
                        <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
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

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress?.address},{" "}
                    {order.shippingAddress?.city}
                    <br />
                    {order.shippingAddress?.postalCode},{" "}
                    {order.shippingAddress?.country}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="flex justify-between text-sm border-t pt-4">
                  <div className="space-y-1 text-muted-foreground">
                    <p>Subtotal</p>
                    <p>Tax</p>
                    <p>Shipping</p>
                    <p className="font-bold text-foreground">Total</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p>
                      $
                      {(
                        order.totalPrice -
                        order.taxPrice -
                        order.shippingPrice
                      ).toFixed(2)}
                    </p>
                    <p>${order.taxPrice.toFixed(2)}</p>
                    <p>${order.shippingPrice.toFixed(2)}</p>
                    <p className="font-bold">${order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                {/* Actions */}
                {order.isPaid && !order.isDelivered && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkDelivered(order._id);
                      }}
                      disabled={deliverOrder.isPending}
                      className="gap-2"
                    >
                      {deliverOrder.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                      Mark as Delivered
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {(!orders || orders.length === 0) && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COUPONS TAB ====================
function CouponsTab() {
  const { data: coupons, isLoading } = useAdminCoupons();
  const deleteCoupon = useDeleteCoupon();
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;

    try {
      await deleteCoupon.mutateAsync(id);
      toast.success("Coupon deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Coupons ({coupons?.length || 0})
        </h2>
        <Button
          onClick={() => setShowAddCoupon(!showAddCoupon)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {showAddCoupon && (
        <CouponForm
          onSuccess={() => setShowAddCoupon(false)}
          onCancel={() => setShowAddCoupon(false)}
        />
      )}

      {editingCoupon && (
        <CouponForm
          coupon={editingCoupon}
          onSuccess={() => setEditingCoupon(null)}
          onCancel={() => setEditingCoupon(null)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((coupon: Coupon) => (
          <div
            key={coupon._id}
            className={`p-4 border rounded-lg bg-card ${
              !coupon.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                <span className="font-mono font-bold text-lg">
                  {coupon.code}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  coupon.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {coupon.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-1 text-sm mb-4">
              <p className="font-medium text-lg">
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}% off`
                  : `$${coupon.discountValue} off`}
              </p>
              {coupon.minPurchase > 0 && (
                <p className="text-muted-foreground">
                  Min. purchase: ${coupon.minPurchase}
                </p>
              )}
              <p className="text-muted-foreground">
                Used: {coupon.usedCount} /{" "}
                {coupon.maxUses > 0 ? coupon.maxUses : "∞"}
              </p>
              {coupon.expiresAt && (
                <p
                  className={`text-xs ${
                    new Date(coupon.expiresAt) < new Date()
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingCoupon(coupon)}
                className="flex-1"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(coupon._id, coupon.code)}
                disabled={deleteCoupon.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {(!coupons || coupons.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No coupons yet. Create your first discount!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Coupon Form (Create/Edit)
function CouponForm({
  coupon,
  onSuccess,
  onCancel,
}: {
  coupon?: Coupon;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon?.discountValue?.toString() || "",
    minPurchase: coupon?.minPurchase?.toString() || "0",
    maxUses: coupon?.maxUses?.toString() || "0",
    isActive: coupon?.isActive ?? true,
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.split("T")[0] : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discountValue) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType as "percentage" | "fixed",
        discountValue: parseFloat(formData.discountValue) || 0,
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxUses: parseInt(formData.maxUses) || 0,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt || null,
      };

      if (coupon) {
        await updateCoupon.mutateAsync({ id: coupon._id, ...payload });
        toast.success("Coupon updated");
      } else {
        await createCoupon.mutateAsync(payload);
        toast.success("Coupon created");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.message || `Failed to ${coupon ? "update" : "create"} coupon`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {coupon ? "Edit Coupon" : "Create New Coupon"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Coupon Code *
          </label>
          <Input
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="SAVE20"
            className="uppercase"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Type *
          </label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-background h-10"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Value * (
            {formData.discountType === "percentage" ? "%" : "$"})
          </label>
          <Input
            name="discountValue"
            value={formData.discountValue}
            onChange={handleChange}
            type="number"
            step={formData.discountType === "percentage" ? "1" : "0.01"}
            max={formData.discountType === "percentage" ? "100" : undefined}
            placeholder={
              formData.discountType === "percentage" ? "20" : "10.00"
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Min. Purchase ($)
          </label>
          <Input
            name="minPurchase"
            value={formData.minPurchase}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="0 = no minimum"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Uses</label>
          <Input
            name="maxUses"
            value={formData.maxUses}
            onChange={handleChange}
            type="number"
            placeholder="0 = unlimited"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <Input
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            type="date"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active (can be used by customers)
          </label>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {coupon ? "Updating..." : "Creating..."}
              </>
            ) : coupon ? (
              "Update Coupon"
            ) : (
              "Create Coupon"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
