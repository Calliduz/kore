import { SkeletonTheme } from 'react-loading-skeleton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Cart from '@/pages/Cart';
import Account from '@/pages/Account';
import Checkout from '@/pages/Checkout';
import ProductDetails from '@/pages/ProductDetails';
import Collections from '@/pages/Collections';
import About from '@/pages/About';
import AdminDashboard from '@/pages/AdminDashboard';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { ThemeProvider } from "@/components/theme-provider"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <BrowserRouter>
                <AuthProvider>
                    <SkeletonTheme baseColor="hsl(var(--color-muted))" highlightColor="hsl(var(--color-background))">
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="shop" element={<Home />} />
                            <Route path="collections" element={<Collections />} />
                            <Route path="about" element={<About />} />
                            <Route path="product/:id" element={<ProductDetails />} />
                            <Route path="cart" element={<Cart />} />
                            <Route path="login" element={<Login />} />
                            <Route path="register" element={<Register />} />
                            
                            {/* Protected Routes */}
                            <Route path="checkout" element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            } />
                            <Route path="account" element={
                                <ProtectedRoute>
                                    <Account />
                                </ProtectedRoute>
                            } />
                            <Route path="admin" element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Routes>
                    <Toaster 
                      position="top-right"
                      expand={true}
                      richColors
                      closeButton
                      duration={4000}
                      toastOptions={{
                        style: {
                          background: 'hsl(var(--color-card))',
                          color: 'hsl(var(--color-card-foreground))',
                          border: '1px solid hsl(var(--color-border))',
                        },
                        className: 'shadow-lg',
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
