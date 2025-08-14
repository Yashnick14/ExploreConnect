// src/store/Registration/registration.js
import { create } from "zustand";

export const useRegistrationStore = create((set, get) => ({
  registrations: [],

  setRegistrations: (list) => set({ registrations: list }),

  createRegistration: async (payload) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message || "Failed to register" };

      // optionally push into list
      set((s) => ({ registrations: [data.data, ...s.registrations] }));
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ createRegistration error:", err.message);
      return { success: false, message: "Server error" };
    }
  },

  // Optional: list registrations (optionally by place)
  fetchRegistrations: async ({ placeId } = {}) => {
    try {
      const url = new URL(`${import.meta.env.VITE_API_BASE_URL || ""}/api/registrations`, window.location.origin);
      if (placeId) url.searchParams.set("place", placeId);

      const res = await fetch(url.toString().replace(window.location.origin, ""));
      const data = await res.json();
      if (!data.success) {
        set({ registrations: [] });
        return { success: false, message: data.message || "Failed to fetch" };
      }
      set({ registrations: data.data || [] });
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ fetchRegistrations error:", err.message);
      set({ registrations: [] });
      return { success: false, message: "Server error" };
    }
  },

  // Optional: delete
  deleteRegistration: async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/registrations/${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message || "Failed to delete" };

      set((s) => ({ registrations: s.registrations.filter((r) => r._id !== id) }));
      return { success: true };
    } catch (err) {
      console.error("❌ deleteRegistration error:", err.message);
      return { success: false, message: "Server error" };
    }
  },
}));
