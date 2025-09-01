// src/store/User/Theme.js
import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "../Auth/auth";

export const useThemeStore = create((set) => {
  const savedTheme = localStorage.getItem("theme") || "theme1";

  // helper to apply theme classes to DOM
  const applyDOMTheme = (theme) => {
    document.documentElement.classList.remove(
      "theme-theme1",
      "theme-theme2",
      "theme-theme3",
      "theme-theme4"
    );
    document.documentElement.classList.add(`theme-${theme}`);
  };

  return {
    theme: savedTheme, // just store, don’t apply immediately

    // ✅ Apply + persist (when user chooses manually)
    setTheme: async (newTheme) => {
      localStorage.setItem("theme", newTheme);
      applyDOMTheme(newTheme);
      set({ theme: newTheme });

      const { user } = useAuthStore.getState();
      if (user?._id) {
        try {
          await axios.put(`/api/user/profile/${user._id}`, { theme: newTheme });
        } catch (err) {
          console.error("❌ Failed to save theme in DB:", err);
        }
      }
    },

    // ✅ Apply only (when logging in, from DB)
    applyTheme: (theme) => {
      localStorage.setItem("theme", theme);
      applyDOMTheme(theme);
      set({ theme });
    },

    resetTheme: () => {
      localStorage.setItem("theme", "theme1");
      applyDOMTheme("theme1");
      set({ theme: "theme1" });
    },
  };
});
