// src/store/User/Registration.js
import { create } from "zustand";

// ---- API base (from Vite env). Trim trailing slashes.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/g, "");
const api = (path) => `${API_BASE}${path}`; // ensures no double slashes

export const useRegistrationStore = create((set, get) => ({
  registrations: [],

  setRegistrations: (list) =>
    set({ registrations: Array.isArray(list) ? list : [] }),

  createRegistration: async (payload) => {
    try {
      const res = await fetch(api("/api/registrations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success)
        return { success: false, message: data.message || "Failed to register" };

      set((s) => ({ registrations: [data.data, ...s.registrations] }));
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ createRegistration error:", err);
      return { success: false, message: "Server error" };
    }
  },

  // Supports optional filters: { placeId, email }
  fetchRegistrations: async ({ placeId, email } = {}) => {
    try {
      // Build query with a proper URL object (works for both proxied and absolute APIs)
      const u = new URL(api("/api/registrations"), window.location.origin);
      if (placeId) u.searchParams.set("place", placeId);
      if (email) u.searchParams.set("email", email);

      const res = await fetch(u.toString().replace(window.location.origin, ""));
      const data = await res.json();
      if (!data.success) {
        set({ registrations: [] });
        return { success: false, message: data.message || "Failed to fetch" };
      }
      set({ registrations: data.data || [] });
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ fetchRegistrations error:", err);
      set({ registrations: [] });
      return { success: false, message: "Server error" };
    }
  },

  // UPDATE — used by your Edit modal
  updateRegistration: async (id, patch) => {
    try {
      const res = await fetch(api(`/api/registrations/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch || {}),
      });
      const data = await res.json();
      if (!data.success)
        return { success: false, message: data.message || "Failed to update" };

      set((s) => ({
        registrations: s.registrations.map((r) =>
          r._id === id ? data.data : r
        ),
      }));
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ updateRegistration error:", err);
      return { success: false, message: "Server error" };
    }
  },

  deleteRegistration: async (id) => {
    try {
      const res = await fetch(api(`/api/registrations/${id}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success)
        return { success: false, message: data.message || "Failed to delete" };

      set((s) => ({
        registrations: s.registrations.filter((r) => r._id !== id),
      }));
      return { success: true };
    } catch (err) {
      console.error("❌ deleteRegistration error:", err);
      return { success: false, message: "Server error" };
    }
  },
}));
