import { useState } from "react";
import { useAdminRefunds, useUpdateRefundStatus } from "@/hooks/useRefunds";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { type RefundRequest, type RefundStatus } from "@/types";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_CONFIG: Record<
  RefundStatus,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: XCircle,
  },
  processed: {
    label: "Processed",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: DollarSign,
  },
};

const REASON_LABELS: Record<string, string> = {
  damaged: "Damaged Product",
  wrong_item: "Wrong Item",
  not_as_described: "Not as Described",
  changed_mind: "Changed Mind",
  other: "Other",
};

export default function AdminRefunds() {
  const { data: refunds, isLoading } = useAdminRefunds();
  const updateRefundStatus = useUpdateRefundStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "all">("all");
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<
    "approved" | "rejected" | "processed"
  >("approved");
  const [adminNotes, setAdminNotes] = useState("");

  const filteredRefunds = refunds?.filter((refund) => {
    const matchesSearch =
      !searchTerm ||
      refund._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof refund.order === "string" && refund.order.includes(searchTerm));

    const matchesStatus =
      statusFilter === "all" || refund.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: refunds?.length || 0,
    pending: refunds?.filter((r) => r.status === "pending").length || 0,
    approved: refunds?.filter((r) => r.status === "approved").length || 0,
    rejected: refunds?.filter((r) => r.status === "rejected").length || 0,
    processed: refunds?.filter((r) => r.status === "processed").length || 0,
  };

  const openUpdateModal = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setNewStatus(refund.status === "pending" ? "approved" : "processed");
    setAdminNotes(refund.adminNotes || "");
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRefund) return;

    try {
      await updateRefundStatus.mutateAsync({
        refundId: selectedRefund._id,
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });
      toast.success(`Refund ${newStatus}`);
      setIsModalOpen(false);
      setSelectedRefund(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update refund");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOrderId = (refund: RefundRequest): string => {
    if (typeof refund.order === "string") {
      return refund.order;
    }
    return refund.order?._id || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Refund Requests</h1>
          <p className="text-muted-foreground">
            Manage customer refund and return requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(["all", "pending", "approved", "rejected", "processed"] as const).map(
          (status) => {
            const config = status === "all" ? null : STATUS_CONFIG[status];
            const Icon = config?.icon || Package;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`p-4 rounded-lg border transition-all ${
                  statusFilter === status
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`h-4 w-4 ${
                      config?.color || "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium capitalize">
                    {status}
                  </span>
                </div>
                <p className="text-2xl font-bold">{statusCounts[status]}</p>
              </button>
            );
          }
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by refund ID or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as RefundStatus | "all")
            }
            className="pl-10 pr-8 py-2 border rounded-lg bg-background appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processed">Processed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Refunds Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4">
                <Skeleton width={80} height={24} />
                <Skeleton width={120} height={20} />
                <div className="flex-1" />
                <Skeleton width={80} height={32} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRefunds && filteredRefunds.length > 0 ? (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium">
                  Request ID
                </th>
                <th className="text-left p-4 text-sm font-medium">Order</th>
                <th className="text-left p-4 text-sm font-medium">Reason</th>
                <th className="text-left p-4 text-sm font-medium">Amount</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Date</th>
                <th className="text-right p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRefunds.map((refund) => {
                const status = STATUS_CONFIG[refund.status];
                const StatusIcon = status.icon;
                const orderId = getOrderId(refund);

                return (
                  <tr
                    key={refund._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm">
                        #{refund._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/admin/orders`}
                        className="text-sm text-primary hover:underline font-mono"
                      >
                        #{orderId.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {REASON_LABELS[refund.reason] || refund.reason}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">
                        ${refund.totalRefundAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(refund.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      {refund.status !== "processed" &&
                        refund.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUpdateModal(refund)}
                          >
                            Update
                          </Button>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground border rounded-lg bg-card">
          <RotateCcw className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No refund requests</h2>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No refunds match your filters"
              : "There are no refund requests yet"}
          </p>
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Refund Status"
      >
        {selectedRefund && (
          <div className="space-y-4">
            {/* Refund Details */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Request ID</span>
                <span className="font-mono">
                  #{selectedRefund._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reason</span>
                <span>{REASON_LABELS[selectedRefund.reason]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  ${selectedRefund.totalRefundAmount.toFixed(2)}
                </span>
              </div>
              {selectedRefund.description && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">
                    Customer Notes:
                  </p>
                  <p className="text-sm">{selectedRefund.description}</p>
                </div>
              )}
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                New Status
              </label>
              <div className="flex gap-2">
                {selectedRefund.status === "pending" && (
                  <>
                    <button
                      onClick={() => setNewStatus("approved")}
                      className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                        newStatus === "approved"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "hover:border-blue-300"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <span className="text-sm font-medium">Approve</span>
                    </button>
                    <button
                      onClick={() => setNewStatus("rejected")}
                      className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                        newStatus === "rejected"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "hover:border-red-300"
                      }`}
                    >
                      <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                      <span className="text-sm font-medium">Reject</span>
                    </button>
                  </>
                )}
                {selectedRefund.status === "approved" && (
                  <button
                    onClick={() => setNewStatus("processed")}
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                      newStatus === "processed"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "hover:border-green-300"
                    }`}
                  >
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <span className="text-sm font-medium">
                      Mark as Processed
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this refund decision..."
                rows={3}
                className="w-full p-3 border rounded-lg bg-background resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={updateRefundStatus.isPending}
                className="flex-1"
              >
                {updateRefundStatus.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
