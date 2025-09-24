import { create } from "zustand";
import { useAuthStore } from "../Auth/auth";

export const usePlaceStore = create((set) => ({
  places: [],
  latestPlaces: [],
  searchResults: [],

  setPlaces: (places) => set({ places }),
  setSearchResults: (results) => set({ searchResults: results }),

  createPlace: async (newPlace) => {
    try {
      const fd = new FormData();

      // Base fields (strings/numbers)
      [
        "name",
        "description",
        "location",
        "district",
        "category",
        "contactNumber",
        "workingHours",
        "lat",
        "lng",
      ].forEach((key) => fd.append(key, newPlace[key]));

      // Boolean -> string for FormData
      fd.append("petsAllowed", String(!!newPlace.petsAllowed));
      fd.append("exclusive", String(!!newPlace.exclusive));

      // Weekly JSON if present
      if (newPlace.workingHoursWeekly !== undefined) {
        const val =
          typeof newPlace.workingHoursWeekly === "string"
            ? newPlace.workingHoursWeekly
            : JSON.stringify(newPlace.workingHoursWeekly);
        fd.append("workingHoursWeekly", val);
      }

      // Files only (ignore string URLs)
      const files = (newPlace.images || []).filter((f) => f instanceof File);
      files.forEach((f) => fd.append("images", f));

      if (files.length === 0) {
        return { success: false, message: "Please add at least one image." };
      }

      const res = await fetch("/api/places", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      set((s) => ({ places: [...s.places, data.data] }));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message || "Server error" };
    }
  },

  fetchPlaces: async () => {
    try {
      const user = useAuthStore.getState().user;
      const userId = user?._id || "";
      const isAdmin = user?.role === "admin";

      const res = await fetch(
        `/api/places?userId=${userId}&isAdmin=${isAdmin ? "true" : "false"}`
      );
      const data = await res.json();
      set({ places: data.data || [] });
    } catch (err) {
      console.error("❌ fetchPlaces error:", err.message);
    }
  },

  getPlaceById: async (id) => {
    try {
      const res = await fetch(`/api/places/${id}`);
      const data = await res.json();
      if (data.success) return { success: true, data: data.data };
      return { success: false, message: data.message };
    } catch (err) {
      console.error("❌ getPlaceById error:", err.message);
      return { success: false, message: "Server error" };
    }
  },

  fetchLatestPlaces: async (isAdmin = false, userId = null) => {
    try {
      const query = new URLSearchParams();
      if (isAdmin) query.append("isAdmin", "true");
      if (userId) query.append("userId", userId);

      const res = await fetch(`/api/places/latest?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch latest places");

      const data = await res.json();
      set({ latestPlaces: data.data || [] });
    } catch (err) {
      console.error("❌ fetchLatestPlaces error:", err.message);
    }
  },

  deletePlace: async (pid) => {
    const res = await fetch(`/api/places/${pid}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };

    set((state) => ({
      places: state.places.filter((place) => place._id !== pid),
    }));
    return { success: true, message: data.message };
  },

  updatePlace: async (id, upd) => {
    try {
      const fd = new FormData();

      [
        "name",
        "description",
        "location",
        "district",
        "category",
        "contactNumber",
        "workingHours",
        "lat",
        "lng",
      ].forEach((key) => fd.append(key, upd[key]));

      fd.append("petsAllowed", String(!!upd.petsAllowed));
      fd.append("exclusive", String(!!upd.exclusive));

      if (upd.workingHoursWeekly !== undefined) {
        const val =
          typeof upd.workingHoursWeekly === "string"
            ? upd.workingHoursWeekly
            : JSON.stringify(upd.workingHoursWeekly);
        fd.append("workingHoursWeekly", val);
      }

      // Only new files (skip strings)
      (upd.images || []).forEach((f) => {
        if (f && typeof f !== "string") fd.append("images", f);
      });

      if (upd.removedIndexes) {
        fd.append("removedIndexes", JSON.stringify(upd.removedIndexes));
      }

      const res = await fetch(`/api/places/${id}`, { method: "PUT", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      set((s) => ({
        places: s.places.map((p) => (p._id === id ? data.data : p)),
      }));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message || "Server error" };
    }
  },

  searchPlaces: async (query) => {
    if (!query || query.trim() === "") {
      set({ searchResults: [] });
      return;
    }
    try {
      const res = await fetch(
        `/api/places/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      set({ searchResults: data.success ? data.data : [] });
    } catch (err) {
      console.error("❌ searchPlaces error:", err.message);
      set({ searchResults: [] });
    }
  },
}));
