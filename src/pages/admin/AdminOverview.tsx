import { useAdminProducts, useAdminOrders } from "@/hooks/useAdmin";
import { useAdminCoupons } from "@/hooks/useCoupons";
import { useAdminUsers } from "@/hooks/useUsers";
import {
  Loader2,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { type Product, type Order } from "@/types";

export default function AdminOverview() {
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: coupons, isLoading: couponsLoading } = useAdminCoupons();
  const { data: users, isLoading: usersLoading } = useAdminUsers();

  const isLoading =
    productsLoading || ordersLoading || couponsLoading || usersLoading;

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
  const totalUsers = users?.length || 0;
  const activeCoupons = coupons?.filter((c: any) => c.isActive).length || 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          subtitle={`From ${paidOrders} paid orders`}
          icon={DollarSign}
          iconColor="text-green-500"
          iconBg="bg-green-100 dark:bg-green-900/30"
          href="/admin/orders"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          subtitle={`${pendingOrders} pending delivery`}
          icon={ShoppingBag}
          iconColor="text-blue-500"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          href="/admin/orders"
        />
        <StatCard
          title="Products"
          value={totalProducts.toString()}
          subtitle={`${lowStockProducts} low stock`}
          icon={Package}
          iconColor="text-purple-500"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          href="/admin/products"
        />
        <StatCard
          title="Users"
          value={totalUsers.toString()}
          subtitle={`${activeCoupons} active coupons`}
          icon={Users}
          iconColor="text-orange-500"
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          href="/admin/users"
        />
      </div>

      {/* Quick Actions / Alerts */}
      {(lowStockProducts > 0 || pendingOrders > 0) && (
        <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium mb-2">
            <AlertCircle className="h-5 w-5" />
            Action Required
          </div>
          <ul className="space-y-1 text-sm text-yellow-600 dark:text-yellow-300">
            {lowStockProducts > 0 && (
              <li>• {lowStockProducts} product(s) are running low on stock</li>
            )}
            {pendingOrders > 0 && (
              <li>• {pendingOrders} paid order(s) awaiting delivery</li>
            )}
          </ul>
        </div>
      )}

      {/* Recent Orders */}
      <div className="p-6 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <Link
            to="/admin/orders"
            className="text-sm text-primary hover:underline"
          >
            View All →
          </Link>
        </div>
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
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
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
    </Link>
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
