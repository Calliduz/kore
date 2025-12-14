import { useState } from "react";
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import toast from "@/lib/toast";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { type Product } from "@/types";

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts =
    products?.filter(
      (p: Product) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteProduct.mutateAsync(
        deleteConfirm._id || deleteConfirm.id || ""
      );
      toast.success("Product deleted successfully");
      setDeleteConfirm(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">
            {products?.length || 0} total products
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
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

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product: Product) => {
          const productId = product._id || product.id;
          return (
            <div
              key={productId}
              className="border rounded-lg bg-card overflow-hidden group"
            >
              {/* Image */}
              <div className="aspect-square bg-muted overflow-hidden">
                <img
                  src={
                    product.images?.[0] ||
                    product.image ||
                    "https://via.placeholder.com/300"
                  }
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {product.category}
                </p>
                <h3 className="font-semibold truncate mt-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold">${product.price?.toFixed(2)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 10
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : product.stock > 0
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteConfirm(product)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>
            {searchQuery
              ? "No products match your search"
              : "No products yet. Add your first product!"}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <ProductForm
          product={editingProduct || undefined}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onCancel={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>"{deleteConfirm?.name}"</strong>? This action cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Product Form Component
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
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
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg bg-background min-h-[80px]"
          placeholder="Product description..."
        />
      </div>

      <div>
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

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
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
      </div>
    </form>
  );
}
