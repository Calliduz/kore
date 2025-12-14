import { useState } from "react";
import {
  useAdminUsers,
  useUpdateUserRole,
  useDeleteUser,
} from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import toast from "@/lib/toast";
import {
  Users,
  Loader2,
  Search,
  X,
  Shield,
  ShieldOff,
  Trash2,
  Mail,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { type User } from "@/types";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const filteredUsers =
    users?.filter(
      (user: User) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const admins = filteredUsers.filter((u: User) => u.role === "admin");
  const regularUsers = filteredUsers.filter((u: User) => u.role !== "admin");

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin"
  ) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success(`User role updated to ${newRole}`);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    if (deleteConfirm._id === currentUser?._id) {
      toast.error("You cannot delete your own account");
      setDeleteConfirm(null);
      return;
    }

    try {
      await deleteUser.mutateAsync(deleteConfirm._id);
      toast.success("User deleted successfully");
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
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
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-muted-foreground">
          {users?.length || 0} total users ({admins.length} admins)
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email..."
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

      {/* Admins Section */}
      {admins.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Administrators ({admins.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {admins.map((user: User) => (
              <UserCard
                key={user._id}
                user={user}
                isCurrentUser={user._id === currentUser?._id}
                onView={() => setSelectedUser(user)}
                onDelete={() => setDeleteConfirm(user)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Users Section */}
      {regularUsers.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            Users ({regularUsers.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularUsers.map((user: User) => (
              <UserCard
                key={user._id}
                user={user}
                isCurrentUser={user._id === currentUser?._id}
                onView={() => setSelectedUser(user)}
                onDelete={() => setDeleteConfirm(user)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{searchQuery ? "No users match your search" : "No users found"}</p>
        </div>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-muted-foreground">{selectedUser.email}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    selectedUser.role === "admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selectedUser.role === "admin" ? "Administrator" : "User"}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 rounded-lg bg-muted/30 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span>
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>

            {/* Role Management */}
            {selectedUser._id !== currentUser?._id && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Role Management</h4>
                <div className="flex gap-2">
                  {selectedUser.role === "admin" ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleRoleChange(selectedUser._id, "user")}
                      disabled={updateRole.isPending}
                    >
                      {updateRole.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldOff className="h-4 w-4" />
                      )}
                      Remove Admin
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        handleRoleChange(selectedUser._id, "admin")
                      }
                      disabled={updateRole.isPending}
                    >
                      {updateRole.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      Make Admin
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedUser(null);
                      setDeleteConfirm(selectedUser);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </div>
            )}

            {selectedUser._id === currentUser?._id && (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                This is your account. You cannot modify your own role or delete
                your account from here.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.email})?
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function UserCard({
  user,
  isCurrentUser,
  onView,
  onDelete,
}: {
  user: User;
  isCurrentUser: boolean;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{user.name}</p>
            {isCurrentUser && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                You
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
          View Details
        </Button>
        {!isCurrentUser && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
