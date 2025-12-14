import { SkeletonTheme } from "react-loading-skeleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";

// User Pages
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Cart from "@/pages/Cart";
import Account from "@/pages/Account";
import Checkout from "@/pages/Checkout";
import ProductDetails from "@/pages/ProductDetails";
import Collections from "@/pages/Collections";
import Wishlist from "@/pages/Wishlist";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import OrderDetails from "@/pages/OrderDetails";
import MyOrders from "@/pages/MyOrders";

// Admin Pages
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminRefunds from "@/pages/admin/AdminRefunds";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <SkeletonTheme
              baseColor="hsl(var(--color-muted))"
              highlightColor="hsl(var(--color-background))"
            >
              <Routes>
                {/* User Routes - with Navbar, Footer */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="collections" element={<Collections />} />
                  <Route
                    path="wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="about" element={<About />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />

                  {/* Protected User Routes */}
                  <Route
                    path="checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="account"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="order/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin Routes - Separate Layout without Navbar/Footer */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="refunds" element={<AdminRefunds />} />
                </Route>
              </Routes>
              <Toaster
                position="bottom-right"
                expand={false}
                closeButton
                duration={5000}
                theme="system"
                className="toaster-group font-sans"
                toastOptions={{
                  classNames: {
                    toast:
                      "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border/50 group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group-[.toaster]:rounded-none group-[.toaster]:items-start group-[.toaster]:p-5 group-[.toaster]:border-l-[4px] group-[.toaster]:data-[type=success]:border-l-[hsl(142,76%,36%)] group-[.toaster]:data-[type=error]:border-l-destructive group-[.toaster]:data-[type=info]:border-l-primary group-[.toaster]:data-[type=warning]:border-l-orange-500 transition-all duration-300 hover:translate-x-[-4px]",
                    title:
                      "group-[.toast]:font-bold group-[.toast]:text-sm group-[.toast]:uppercase group-[.toast]:tracking-wider group-[.toast]:text-foreground/90",
                    description:
                      "group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:mt-1.5 group-[.toast]:leading-relaxed group-[.toast]:font-medium",
                    actionButton:
                      "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-none group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:tracking-wide",
                    cancelButton:
                      "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-none",
                    closeButton:
                      "group-[.toast]:!bg-background group-[.toast]:!border-border/50 group-[.toast]:!text-muted-foreground group-[.toast]:hover:!bg-foreground group-[.toast]:hover:!text-background group-[.toast]:hover:!border-foreground group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:rounded-none group-[.toast]:!top-4 group-[.toast]:!right-4 group-[.toast]:w-6 group-[.toast]:h-6 group-[.toast]:opacity-0 group-hover:group-[.toast]:opacity-100",
                    error: "group-[.toast]:text-destructive",
                    success: "group-[.toast]:text-[hsl(142,76%,36%)]",
                    warning: "group-[.toast]:text-orange-500",
                    info: "group-[.toast]:text-primary",
                  },
                }}
              />
            </SkeletonTheme>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
