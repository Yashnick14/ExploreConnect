// src/store/User/Registration.js
import { create } from "zustand";

// ---- API base (from Vite env). Trim trailing slashes.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/g, "");
const api = (path) => `${API_BASE}${path}`; // ensures no double slashes

export const useRegistrationStore = create((set, get) => ({
  registrations: [],

  setRegistrations: (list) =>
    set({ registrations: Array.isArray(list) ? list : [] }),

  /**
   * Check if the user already has a registration for the same place & date
   * that is either PENDING or APPROVED (i.e., should block).
   * Returns: { exists: boolean, match?: object }
   */
  hasBlockedRegistration: async ({ email, placeId, date }) => {
    if (!email || !placeId || !date) return { exists: false };

    try {
      // Re-use the list endpoint (server already supports place/email filters)
      // We also send 'date' as a query param; if the API ignores it, we filter on client.
      const u = new URL(api("/api/registrations"), window.location.origin);
      u.searchParams.set("place", placeId);
      u.searchParams.set("email", email);
      u.searchParams.set("date", date);

      const res = await fetch(u.toString().replace(window.location.origin, ""));
      const data = await res.json();

      const items = Array.isArray(data?.data) ? data.data : [];
      const match = items.find((r) =>
        String(r?.date) === String(date) &&
        ["pending", "approved"].includes(String(r?.status || "").toLowerCase())
      );

      return { exists: !!match, match };
    } catch (err) {
      console.error("❌ hasBlockedRegistration error:", err);
      return { exists: false };
    }
  },

  /* CREATE */
  createRegistration: async (payload) => {
    try {
      // --- Safety pre-check on the client as an extra guard (server should also enforce) ---
      const { email, placeId, date } = payload || {};
      if (email && placeId && date) {
        const { exists } = await get().hasBlockedRegistration({ email, placeId, date });
        if (exists) {
          return {
            success: false,
            message:
              "You already have a pending/approved registration for this place on that date.",
          };
        }
      }

      const res = await fetch(api("/api/registrations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        /* ignore parse error */
      }

      if (!res.ok || !data?.success) {
        const fallback =
          res.status === 409
            ? "You already have a pending/approved registration for this place on that date."
            : "Failed to create registration";
        return { success: false, message: data?.message || fallback };
      }

      set((s) => ({ registrations: [data.data, ...s.registrations] }));
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ createRegistration error:", err);
      return { success: false, message: "Network or server error" };
    }
  },

  /* LIST (supports filters: { placeId, email }) */
  fetchRegistrations: async ({ placeId, email } = {}) => {
    try {
      const u = new URL(api("/api/registrations"), window.location.origin);
      if (placeId) u.searchParams.set("place", placeId);
      if (email) u.searchParams.set("email", email);

      const res = await fetch(u.toString().replace(window.location.origin, ""));
      const data = await res.json();
      if (!data.success) {
        set({ registrations: [] });
        return { success: false, message: data.message || "Failed to fetch" };
      }
      set({ registrations: data.data || [] }); // may include pendingEdit
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ fetchRegistrations error:", err);
      set({ registrations: [] });
      return { success: false, message: "Server error" };
    }
  },

  /* UPDATE — Admin/system; users can also rely on this for cancel */
  updateRegistration: async (id, patch) => {
    try {
      const res = await fetch(api(`/api/registrations/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch || {}),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, message: data?.message || "Failed to update" };
      }

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

  /* DELETE (kept for admin/UI where needed) */
  deleteRegistration: async (id) => {
    try {
      const res = await fetch(api(`/api/registrations/${id}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, message: data?.message || "Failed to delete" };
      }

      set((s) => ({
        registrations: s.registrations.filter((r) => r._id !== id),
      }));
      return { success: true };
    } catch (err) {
      console.error("❌ deleteRegistration error:", err);
      return { success: false, message: "Server error" };
    }
  },

  /* USER: create edit request (pending approval) */
  createEditRequest: async (registrationId, payload /* { email, phone, time, people, date } */) => {
    try {
      const res = await fetch(api(`/api/registrations/${registrationId}/edit-requests`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, message: data?.message || "Failed to request edit" };
      }

      const reqDoc = data.data;
      set((s) => ({
        registrations: s.registrations.map((r) =>
          r._id === registrationId ? { ...r, pendingEdit: reqDoc } : r
        ),
      }));

      return { success: true, data: reqDoc };
    } catch (err) {
      console.error("❌ createEditRequest error:", err);
      return { success: false, message: "Server error" };
    }
  },
}));
