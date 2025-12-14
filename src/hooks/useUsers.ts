import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type ApiResponse, type User } from "@/types";

// Admin: Get all users
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ users: User[] }>>("/users");
      return data.data?.users || [];
    },
  });
}

// Admin: Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin";
    }) => {
      const { data } = await api.put<ApiResponse<{ user: User }>>(
        `/users/${userId}/role`,
        { role }
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to update user role");
      }
      return data.data?.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// Admin: Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/users/${userId}`);
      if (!data.success) {
        throw new Error(data.message || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// Admin: Get user by ID
export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      const { data } = await api.get<ApiResponse<{ user: User }>>(
        `/users/${userId}`
      );
      return data.data?.user;
    },
    enabled: !!userId,
  });
}
