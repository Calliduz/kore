import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useRequestRefund } from "@/hooks/useRefunds";
import { type Order, type RefundReason } from "@/types";
import { toast } from "sonner";
import { Loader2, RotateCcw, AlertTriangle } from "lucide-react";

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const REFUND_REASONS: {
  value: RefundReason;
  label: string;
  description: string;
}[] = [
  {
    value: "damaged",
    label: "Damaged Product",
    description: "Product arrived broken or damaged",
  },
  {
    value: "wrong_item",
    label: "Wrong Item",
    description: "Received a different item than ordered",
  },
  {
    value: "not_as_described",
    label: "Not as Described",
    description: "Product doesn't match the listing",
  },
  {
    value: "changed_mind",
    label: "Changed Mind",
    description: "No longer want the product",
  },
  {
    value: "other",
    label: "Other",
    description: "Another reason not listed above",
  },
];

export default function RefundRequestModal({
  isOpen,
  onClose,
  order,
}: RefundRequestModalProps) {
  const requestRefund = useRequestRefund();
  const [selectedReason, setSelectedReason] = useState<RefundReason | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const handleItemToggle = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === order.orderItems?.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(order.orderItems?.map((_, i) => i)));
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for your refund request");
      return;
    }

    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to refund");
      return;
    }

    try {
      const items = Array.from(selectedItems).map((index) => {
        const item = order.orderItems[index];
        return {
          product: item.product,
          qty: item.qty,
        };
      });

      await requestRefund.mutateAsync({
        orderId: order._id,
        reason: selectedReason,
        description: description || undefined,
        items,
      });

      toast.success("Refund request submitted successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit refund request");
    }
  };

  const selectedTotal = Array.from(selectedItems).reduce((sum, index) => {
    const item = order.orderItems?.[index];
    return sum + (item ? item.qty * item.price : 0);
  }, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request a Refund" size="lg">
      <div className="space-y-6">
        {/* Warning */}
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Refund Policy
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Refund requests are reviewed within 3-5 business days. Products
                must be in original condition for full refunds.
              </p>
            </div>
          </div>
        </div>

        {/* Select Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Select Items to Return</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selectedItems.size === order.orderItems?.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.orderItems?.map((item, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedItems.has(index)
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(index)}
                  onChange={() => handleItemToggle(index)}
                  className="rounded"
                />
                <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.qty} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-medium">
                  ${(item.qty * item.price).toFixed(2)}
                </span>
              </label>
            ))}
          </div>
          {selectedItems.size > 0 && (
            <p className="text-sm text-right mt-2 text-muted-foreground">
              Estimated refund:{" "}
              <span className="font-medium text-foreground">
                ${selectedTotal.toFixed(2)}
              </span>
            </p>
          )}
        </div>

        {/* Reason Selection */}
        <div>
          <h3 className="font-medium mb-3">Reason for Return</h3>
          <div className="space-y-2">
            {REFUND_REASONS.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedReason === reason.value
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="refund-reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={() => setSelectedReason(reason.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{reason.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block font-medium mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide any additional information about your refund request..."
            rows={3}
            className="w-full p-3 border rounded-lg bg-background resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              requestRefund.isPending ||
              !selectedReason ||
              selectedItems.size === 0
            }
            className="flex-1 gap-2"
          >
            {requestRefund.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
