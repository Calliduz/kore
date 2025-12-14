import { useState } from "react";
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  type Coupon,
} from "@/hooks/useCoupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import toast from "@/lib/toast";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Percent,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useAdminCoupons();
  const deleteCoupon = useDeleteCoupon();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Coupon | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCoupon.mutateAsync(deleteConfirm._id);
      toast.success("Coupon deleted successfully");
      setDeleteConfirm(null);
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

  const activeCoupons = coupons?.filter((c: Coupon) => c.isActive) || [];
  const inactiveCoupons = coupons?.filter((c: Coupon) => !c.isActive) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Coupons</h2>
          <p className="text-muted-foreground">
            {activeCoupons.length} active, {inactiveCoupons.length} inactive
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Active Coupons */}
      {activeCoupons.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-500" />
            Active Coupons
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeCoupons.map((coupon: Coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onEdit={() => setEditingCoupon(coupon)}
                onDelete={() => setDeleteConfirm(coupon)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Coupons */}
      {inactiveCoupons.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            Inactive Coupons
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveCoupons.map((coupon: Coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onEdit={() => setEditingCoupon(coupon)}
                onDelete={() => setDeleteConfirm(coupon)}
              />
            ))}
          </div>
        </div>
      )}

      {coupons?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No coupons yet. Create your first discount!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || !!editingCoupon}
        onClose={() => {
          setShowAddModal(false);
          setEditingCoupon(null);
        }}
        title={editingCoupon ? "Edit Coupon" : "Create New Coupon"}
        size="md"
      >
        <CouponForm
          coupon={editingCoupon || undefined}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingCoupon(null);
          }}
          onCancel={() => {
            setShowAddModal(false);
            setEditingCoupon(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Coupon"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete coupon{" "}
            <strong>"{deleteConfirm?.code}"</strong>? This action cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCoupon.isPending}
            >
              {deleteCoupon.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...
                </>
              ) : (
                "Delete Coupon"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CouponCard({
  coupon,
  onEdit,
  onDelete,
}: {
  coupon: Coupon;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  return (
    <div
      className={`p-4 border rounded-lg bg-card ${
        !coupon.isActive || isExpired ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {coupon.discountType === "percentage" ? (
            <Percent className="h-5 w-5 text-primary" />
          ) : (
            <DollarSign className="h-5 w-5 text-primary" />
          )}
          <span className="font-mono font-bold text-lg">{coupon.code}</span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isExpired
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : coupon.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {isExpired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <p className="font-medium text-xl">
          {coupon.discountType === "percentage"
            ? `${coupon.discountValue}% off`
            : `$${coupon.discountValue} off`}
        </p>
        {coupon.minPurchase > 0 && (
          <p className="text-muted-foreground flex items-center gap-1">
            Min. purchase: ${coupon.minPurchase}
          </p>
        )}
        <p className="text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" />
          Used: {coupon.usedCount} / {coupon.maxUses > 0 ? coupon.maxUses : "∞"}
        </p>
        {coupon.expiresAt && (
          <p
            className={`text-xs flex items-center gap-1 ${
              isExpired ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {isExpired ? "Expired" : "Expires"}:{" "}
            {new Date(coupon.expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1 gap-2"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
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
      </div>

      <div className="flex items-center gap-2">
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

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
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
      </div>
    </form>
  );
}
