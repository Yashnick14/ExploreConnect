// store/User/user.js
import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "../Auth/auth"; // <-- to sync updated user into auth store

export const useUserStore = create((set, get) => ({
  users: [],
  setUsers: (users) => set({ users }),

  // Fetch all users (admin only)
  fetchUsers: async () => {
    try {
      const res = await fetch("/api/admin/admin-users");
      const data = await res.json();
      if (data.success) set({ users: data.data });
    } catch (err) {
      console.error("❌ Error fetching users:", err.message);
    }
  },

  // Toggle active/inactive status
  toggleStatus: async (id) => {
    try {
      const res = await fetch(`/api/admin/admin-users/status/${id}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        const updatedUsers = get().users.map((user) =>
          user._id === id ? { ...user, status: data.data.status } : user
        );
        set({ users: updatedUsers });
      }
      return data;
    } catch (err) {
      console.error("❌ Error toggling status:", err.message);
      return { success: false, message: err.message };
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const res = await fetch(`/api/admin/admin-users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const updatedUsers = get().users.filter((u) => u._id !== id);
        set({ users: updatedUsers });
      }
      return data;
    } catch (err) {
      console.error("❌ Error deleting user:", err.message);
      return { success: false, message: err.message };
    }
  },

  // ✅ Update logged-in user profile
  updateUserProfile: async (id, formData) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        // 🔥 Sync with Auth Store so username + avatar persist after reload
        useAuthStore.getState().setUser(res.data.data);
      }

      return res.data;
    } catch (err) {
      console.error("❌ Error in updateUserProfile:", err.message);
      return { success: false, message: err.message };
    }
  },
}));
