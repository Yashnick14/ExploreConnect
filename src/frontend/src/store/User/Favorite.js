import { create } from "zustand";

export const useFavoritesStore = create((set, get) => ({
  favorites: [],          // array of Place docs (with images)
  favoriteIds: new Set(), // quick lookup

  setFavorites: (places) =>
    set({
      favorites: places || [],
      favoriteIds: new Set((places || []).map((p) => p._id)),
    }),

  fetchFavorites: async (email) => {
    if (!email) return { success: false, message: "No email" };
    try {
      const res = await fetch(`/api/favorites?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!data.success) {
        set({ favorites: [], favoriteIds: new Set() });
        return { success: false, message: data.message || "Failed to fetch favorites" };
      }
      get().setFavorites(data.data || []);
      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ fetchFavorites error:", err.message);
      set({ favorites: [], favoriteIds: new Set() });
      return { success: false, message: "Server error" };
    }
  },

  addFavorite: async (email, placeId) => {
    try {
      const res = await fetch(`/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, placeId }),
      });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message || "Failed to add favorite" };

      // merge
      set((s) => {
        const exists = s.favoriteIds.has(placeId);
        const nextFavs = exists ? s.favorites : [data.data, ...s.favorites];
        const nextIds = new Set(nextFavs.map((p) => p._id));
        return { favorites: nextFavs, favoriteIds: nextIds };
      });
      return { success: true };
    } catch (err) {
      console.error("❌ addFavorite error:", err.message);
      return { success: false, message: "Server error" };
    }
  },

  removeFavorite: async (email, placeId) => {
    try {
      const url = `/api/favorites?email=${encodeURIComponent(email)}&place=${encodeURIComponent(placeId)}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message || "Failed to remove favorite" };

      set((s) => {
        const nextFavs = s.favorites.filter((p) => p._id !== placeId);
        const nextIds = new Set(nextFavs.map((p) => p._id));
        return { favorites: nextFavs, favoriteIds: nextIds };
      });
      return { success: true };
    } catch (err) {
      console.error("❌ removeFavorite error:", err.message);
      return { success: false, message: "Server error" };
    }
  },

  toggleFavorite: async (email, placeId) => {
    const { favoriteIds, addFavorite, removeFavorite } = get();
    if (favoriteIds.has(placeId)) {
      return await removeFavorite(email, placeId);
    } else {
      return await addFavorite(email, placeId);
    }
  },
}));
