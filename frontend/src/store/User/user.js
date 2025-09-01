// src/store/User/user.js
import { create } from "zustand";
import axios from "axios";
<<<<<<< HEAD
import { useAuthStore } from "../Auth/auth";
import { normalizeUser } from "@/store/User/NormalizeUser"; // ✅ import utility
=======
import { useAuthStore } from "../Auth/auth"; // <-- to sync updated user into auth store
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

export const useUserStore = create((set, get) => ({
  users: [],
  setUsers: (users) => set({ users: users.map(normalizeUser) }),

  // Fetch all users (admin only)
  fetchUsers: async () => {
    try {
      const res = await fetch("/api/admin/admin-users");
      const data = await res.json();
<<<<<<< HEAD
      if (data.success) {
        set({ users: data.data.map(normalizeUser) }); // ✅ normalize list
      }
=======
      if (data.success) set({ users: data.data });
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
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
<<<<<<< HEAD

      if (data.success) {
        const updatedUsers = get().users.map((user) =>
          user._id === id
            ? normalizeUser({ ...user, status: data.data.status }) // ✅ normalize
            : user
        );
        set({ users: updatedUsers });
      }

=======
      if (data.success) {
        const updatedUsers = get().users.map((user) =>
          user._id === id ? { ...user, status: data.data.status } : user
        );
        set({ users: updatedUsers });
      }
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
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
<<<<<<< HEAD

=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
      if (data.success) {
        const updatedUsers = get().users.filter((u) => u._id !== id);
        set({ users: updatedUsers });
      }
<<<<<<< HEAD

=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
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
<<<<<<< HEAD
        `${import.meta.env.VITE_API_BASE_URL}/api/user/profile/${id}`,
=======
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile/${id}`,
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
<<<<<<< HEAD
        const normalized = normalizeUser(res.data.data);
        useAuthStore.getState().setUser(normalized);

        const updatedUsers = get().users.map((u) =>
          u._id === id ? normalized : u
        );
        set({ users: updatedUsers });
=======
        // 🔥 Sync with Auth Store so username + avatar persist after reload
        useAuthStore.getState().setUser(res.data.data);
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
      }

      return res.data;
    } catch (err) {
<<<<<<< HEAD
      // ✅ extract server message if available
      const message = err.response?.data?.message || "Error updating profile";

      return { success: false, message };
=======
      console.error("❌ Error in updateUserProfile:", err.message);
      return { success: false, message: err.message };
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
    }
  },
}));
