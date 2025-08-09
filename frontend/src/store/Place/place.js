import { create } from "zustand";

export const usePlaceStore = create((set) => ({
  places: [],
  latestPlaces: [],
  searchResults: [],

  setPlaces: (places) => set({ places }),
  setSearchResults: (results) => set({ searchResults: results }),

  createPlace: async (newPlace) => {
    try {
      const fd = new FormData();
      // append all fields:
      ["name","description","location","district",
       "category","contactNumber","workingHours","petsAllowed",
       "lat","lng"
      ].forEach(key => fd.append(key, newPlace[key]));
      // images:
      newPlace.images.forEach(f => f && fd.append("images", f));

      const res = await fetch("/api/places", { method:"POST", body:fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      set((s) => ({ places: [...s.places, data.data] }));
      return { success:true };
    } catch (err) {
      console.error(err);
      return { success:false, message:err.message };
    }
  },

  fetchPlaces: async () => {
    const res = await fetch("/api/places");
    const data = await res.json();
    set({ places: data.data });
  },

  getPlaceById: async (id) => {
  try {
    const res = await fetch(`/api/places/${id}`);
    const data = await res.json();

    if (data.success) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.error("❌ getPlaceById error:", err.message);
    return { success: false, message: "Server error" };
  }
  },

  fetchLatestPlaces: async () => {
    try {
      const res = await fetch("/api/places/latest");
      if (!res.ok) throw new Error("Failed to fetch latest places");
      const data = await res.json();
      set({ latestPlaces: data.data });
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
      ["name","description","location","district",
       "category","contactNumber","workingHours","petsAllowed",
       "lat","lng"
      ].forEach(key => fd.append(key, upd[key]));
      upd.images.forEach(f => f && typeof f!=="string" && fd.append("images", f));
      if (upd.removedIndexes)
        fd.append("removedIndexes", JSON.stringify(upd.removedIndexes));

      const res = await fetch(`/api/places/${id}`, { method:"PUT", body:fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      set((s) => ({
        places: s.places.map(p => p._id===id ? data.data : p)
      }));
      return { success:true };
    } catch (err) {
      console.error(err);
      return { success:false, message:err.message };
    }
  },

  searchPlaces: async (query) => {
    if (!query || query.trim() === "") {
      set({ searchResults: [] });
      return;
    }

    try {
      const res = await fetch(`/api/places/search?q=${query}`);
      const data = await res.json();

      if (data.success) {
        set({ searchResults: data.data });
      } else {
        set({ searchResults: [] });
      }
    } catch (err) {
      console.error("❌ searchPlaces error:", err.message);
      set({ searchResults: [] });
    }
  },

}));
