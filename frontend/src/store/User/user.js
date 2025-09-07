// src/store/User/user.js
import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "../Auth/auth";
import { normalizeUser } from "@/store/User/NormalizeUser"; // ✅ import utility

export const useUserStore = create((set, get) => ({
  users: [],
  setUsers: (users) => set({ users: users.map(normalizeUser) }),

  // Fetch all users (admin only)
  fetchUsers: async () => {
    try {
      const res = await fetch("/api/admin/admin-users");
      const data = await res.json();
      if (data.success) {
        set({ users: data.data.map(normalizeUser) }); // ✅ normalize list
      }
    } catch (err) {
      console.error("❌ Error fetching users:", err.message);
    }
  },

  fetchPlaces: async () => {
    try {
      const res = await fetch("/api/places"); // always fetch all
      const data = await res.json();
      set({ places: data.data || [] });
    } catch (err) {
      console.error("❌ fetchPlaces error:", err.message);
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
          user._id === id
            ? normalizeUser({ ...user, status: data.data.status }) // ✅ normalize
            : user
        );
        set({ users: updatedUsers });
      }

      return data;
    } catch (err) {
      console.error("❌ Error toggling status:", err.message);
      return { success: false, message: err.message };
    }
  },

  deleteUser: async (id, force = false) => {
    try {
      const res = await fetch(`/api/admin/admin-users/${id}?force=${force}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.requiresConfirmation) {
        return { requiresConfirmation: true, message: data.message };
      }

      if (data.success) {
        set((state) => ({
          users: state.users.filter((u) => u._id !== id),
        }));
      }

      return data;
    } catch (err) {
      console.error("❌ Error deleting user:", err.message);
      return { success: false, message: err.message };
    }
  },

  // Update logged-in user profile
  updateUserProfile: async (id, formData) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/profile/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        const normalized = normalizeUser(res.data.data);
        useAuthStore.getState().setUser(normalized);

        const updatedUsers = get().users.map((u) =>
          u._id === id ? normalized : u
        );
        set({ users: updatedUsers });
      }

      return res.data;
    } catch (err) {
      // ✅ extract server message if available
      const message = err.response?.data?.message || "Error updating profile";

      return { success: false, message };
    }
  },
}));
