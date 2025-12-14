import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/useUserData";
import { type SavedAddress } from "@/types";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Star,
  Loader2,
  Home,
  Briefcase,
  Building2,
} from "lucide-react";

interface AddressManagerProps {
  mode?: "full" | "compact"; // compact mode for checkout selection
  onSelect?: (address: SavedAddress) => void;
  selectedAddressId?: string;
}

const ADDRESS_LABELS = [
  { value: "Home", icon: Home },
  { value: "Work", icon: Briefcase },
  { value: "Office", icon: Building2 },
  { value: "Other", icon: MapPin },
];

export default function AddressManager({
  mode = "full",
  onSelect,
  selectedAddressId,
}: AddressManagerProps) {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );
  const [formData, setFormData] = useState({
    label: "Home",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      label: "Home",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (address: SavedAddress) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await updateAddress.mutateAsync({
          id: editingAddress._id,
          ...formData,
        });
        toast.success("Address updated");
      } else {
        await createAddress.mutateAsync(formData);
        toast.success("Address added");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save address");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Address deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress.mutateAsync(id);
      toast.success("Default address updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to set default address");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compact mode for checkout
  if (mode === "compact") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Select Shipping Address</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={openAddModal}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add New
          </Button>
        </div>

        {addresses && addresses.length > 0 ? (
          <div className="space-y-2">
            {addresses.map((address) => (
              <button
                key={address._id}
                onClick={() => onSelect?.(address)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedAddressId === address._id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm">{address.address}</p>
                <p className="text-xs text-muted-foreground">
                  {address.city}, {address.postalCode}, {address.country}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No saved addresses</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAddress ? "Edit Address" : "Add New Address"}
        >
          <AddressForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={createAddress.isPending || updateAddress.isPending}
            isEditing={!!editingAddress}
          />
        </Modal>
      </div>
    );
  }

  // Full mode for account page
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="font-semibold">Saved Addresses</h2>
        </div>
        <Button onClick={openAddModal} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses && addresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => {
            const LabelIcon =
              ADDRESS_LABELS.find((l) => l.value === address.label)?.icon ||
              MapPin;

            return (
              <div
                key={address._id}
                className={`p-4 rounded-lg border bg-card relative ${
                  address.isDefault ? "border-primary/50" : ""
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <LabelIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{address.label}</span>
                </div>

                <p className="text-sm">{address.address}</p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.country}
                </p>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address._id)}
                      disabled={setDefaultAddress.isPending}
                      className="text-xs"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(address)}
                    className="text-xs"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address._id)}
                    disabled={deleteAddress.isPending}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No saved addresses</p>
          <p className="text-sm">Add an address for faster checkout</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      >
        <AddressForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={createAddress.isPending || updateAddress.isPending}
          isEditing={!!editingAddress}
        />
      </Modal>
    </div>
  );
}

// Address form component
function AddressForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  isEditing,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isEditing: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Label</label>
        <div className="flex gap-2 flex-wrap">
          {ADDRESS_LABELS.map((label) => (
            <button
              key={label.value}
              type="button"
              onClick={() => setFormData({ ...formData, label: label.value })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.label === label.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted hover:border-primary/50"
              }`}
            >
              <label.icon className="h-3 w-3" />
              {label.value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Street Address</label>
        <Input
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="123 Main Street"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="New York"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Postal Code</label>
          <Input
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            placeholder="10001"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Country</label>
        <Input
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
          placeholder="United States"
          required
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData({ ...formData, isDefault: e.target.checked })
          }
          className="rounded border-muted"
        />
        <span className="text-sm">Set as default address</span>
      </label>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isEditing ? (
          "Update Address"
        ) : (
          "Add Address"
        )}
      </Button>
    </form>
  );
}
