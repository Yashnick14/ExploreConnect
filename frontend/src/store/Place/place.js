import { create } from "zustand";

export const usePlaceStore = create((set) => ({
  places: [],
  latestPlaces: [],
  searchResults: [],

  setPlaces: (places) => set({ places }),
  setSearchResults: (results) => set({ searchResults: results }),

  createPlace: async (newPlace) => {
    try {
      const formData = new FormData();
      formData.append("name", newPlace.name);
      formData.append("description", newPlace.description);
      formData.append("location", newPlace.location);
      formData.append("district", newPlace.district);
      formData.append("category", newPlace.category);
      formData.append("contactNumber", newPlace.contactNumber);
      formData.append("workingHours", newPlace.workingHours);
      formData.append("petsAllowed", newPlace.petsAllowed);

      // Append all 4 images (only if they exist)
      newPlace.images.forEach((file) => {
        if (file) formData.append("images", file);
      });

      const res = await fetch("/api/places", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      set((state) => ({ places: [...state.places, data.data] }));
      return { success: true, message: "Place created successfully" };
    } catch (err) {
      console.error("❌ createPlace error:", err.message);
      return { success: false, message: "Server error" };
    }
  },

  fetchPlaces: async () => {
    const res = await fetch("/api/places");
    const data = await res.json();
    set({ places: data.data });
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

  updatePlace: async (pid, updateData) => {
    try {
      const formData = new FormData();

      for (const key in updateData) {
        if (key === "images") {
          updateData.images.forEach(file => {
            if (file && typeof file !== "string") {
              formData.append("images", file);
            }
          });
        } else {
          formData.append(key, updateData[key]);
        }
      }

      const res = await fetch(`/api/places/${pid}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) return { success: false, message: data.message };

      set((state) => ({
        places: state.places.map((place) =>
          place._id === pid ? data.data : place
        ),
      }));

      return { success: true, message: data.message };
    } catch (err) {
      console.error("❌ updatePlace error:", err.message);
      return { success: false, message: "Server error" };
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
