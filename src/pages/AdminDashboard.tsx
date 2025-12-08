import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminProducts, useCreateProduct, useDeleteProduct, useAdminOrders } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  LayoutDashboard,
  ShoppingBag,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Redirect non-admins
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-16">
        <LayoutDashboard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You need admin privileges to access this page.
        </p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your store products and orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="h-4 w-4 inline mr-2" />
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingBag className="h-4 w-4 inline mr-2" />
          Orders
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' && (
        <ProductsTab showAddProduct={showAddProduct} setShowAddProduct={setShowAddProduct} />
      )}
      {activeTab === 'orders' && <OrdersTab />}
    </div>
  );
}

// Products Tab Component
function ProductsTab({
  showAddProduct,
  setShowAddProduct,
}: {
  showAddProduct: boolean;
  setShowAddProduct: (show: boolean) => void;
}) {
  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
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
        <h2 className="text-xl font-semibold">Products ({products?.length || 0})</h2>
        <Button onClick={() => setShowAddProduct(!showAddProduct)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showAddProduct && (
        <AddProductForm onSuccess={() => setShowAddProduct(false)} />
      )}

      <div className="border rounded-lg overflow-hidden">
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
            {products?.map((product: any, index: number) => {
              const productId = product._id || product.id;
              return (
              <tr key={productId || `product-${index}`} className="hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                      <img
                        src={product.images?.[0] || product.image || 'https://via.placeholder.com/100'}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{product.category}</td>
                <td className="p-4">${product.price?.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => productId && handleDelete(productId, product.name)}
                      disabled={deleteProduct.isPending || !productId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>

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

// Add Product Form
function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const createProduct = useCreateProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '10',
    images: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price || !formData.images) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        images: formData.images.split(',').map((url) => url.trim()),
      });
      toast.success('Product created successfully');
      setFormData({ name: '', description: '', price: '', category: '', stock: '10', images: '' });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-background"
            placeholder="Product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-background"
            placeholder="Electronics, Clothing, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price ($) *</label>
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            type="number"
            step="0.01"
            className="w-full p-2 border rounded-lg bg-background"
            placeholder="29.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock *</label>
          <input
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            type="number"
            className="w-full p-2 border rounded-lg bg-background"
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
          <input
            name="images"
            value={formData.images}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-background"
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate multiple URLs with commas
          </p>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={isSubmitting || createProduct.isPending}>
            {isSubmitting || createProduct.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// Orders Tab Component
function OrdersTab() {
  const { data: orders, isLoading } = useAdminOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">All Orders ({orders?.length || 0})</h2>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Order ID</th>
              <th className="text-left p-4 font-medium">Customer</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Payment</th>
              <th className="text-left p-4 font-medium">Delivery</th>
              <th className="text-left p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders?.map((order: any) => (
              <tr key={order._id} className="hover:bg-muted/30">
                <td className="p-4 font-mono text-sm">
                  #{order._id?.slice(-8).toUpperCase()}
                </td>
                <td className="p-4">
                  {typeof order.user === 'object' ? order.user.email : order.user}
                </td>
                <td className="p-4 font-semibold">${order.totalPrice?.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.isPaid
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.isDelivered
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {order.isDelivered ? 'Delivered' : 'Processing'}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!orders || orders.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
