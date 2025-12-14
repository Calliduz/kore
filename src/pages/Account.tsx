import { useAuth } from "@/hooks/useAuth";
import { useMyOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import AddressManager from "@/components/features/AddressManager";
import PaymentMethodManager from "@/components/features/PaymentMethodManager";
import {
  Package,
  User as UserIcon,
  LogOut,
  Settings,
  Clock,
  CheckCircle,
  Truck,
  Loader2,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { type ApiResponse, type AuthResponse } from "@/types";
import Skeleton from "react-loading-skeleton";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters if provided",
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Account() {
  const { user, logout } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const payload: { name: string; password?: string } = { name: data.name };
      if (data.password) {
        payload.password = data.password;
      }

      const { data: response } = await api.put<ApiResponse<AuthResponse>>(
        "/users/profile",
        payload
      );

      if (response.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        reset({ name: data.name, password: "" });
        // Force page refresh to update user context
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get recent orders (last 3)
  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserIcon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">Profile</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    {...register("name")}
                    className="w-full p-2 border rounded-lg bg-background"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="w-full p-2 border rounded-lg bg-background"
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">Recent Orders</h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/orders">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton width={120} height={20} />
                        <Skeleton width={80} height={16} />
                      </div>
                      <Skeleton width={60} height={24} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order._id}
                    to={`/order/${order._id}`}
                    className="block p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <p className="font-bold">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm mt-2">
                      <div className="flex items-center gap-1">
                        {order.isPaid ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">
                              Paid
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-600 dark:text-yellow-400">
                              Awaiting Payment
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {order.isDelivered ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">
                              Delivered
                            </span>
                          </>
                        ) : (
                          <>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              In Transit
                            </span>
                          </>
                        )}
                      </div>

                      {/* Pay Now for unpaid orders */}
                      {!order.isPaid && (
                        <Button
                          size="sm"
                          className="ml-auto gap-1"
                          onClick={(e) => e.stopPropagation()}
                          asChild
                        >
                          <Link to={`/order/${order._id}`}>
                            <CreditCard className="h-3 w-3" />
                            Pay Now
                          </Link>
                        </Button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto opacity-50 mb-2" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm">
                  When you make a purchase, it will appear here.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/shop">Start Shopping</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Addresses and Payment Methods */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-lg border bg-card">
          <AddressManager />
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <PaymentMethodManager />
        </div>
      </div>
    </div>
  );
}
