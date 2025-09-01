// src/store/Auth/auth.js
import { create } from "zustand";
import axios from "axios";
import { getAuth, signOut as fbSignOut } from "firebase/auth";
import { normalizeUser } from "@/store/User/NormalizeUser";
import { useThemeStore } from "@/store/User/Theme"; // 👈 theme store

const STORAGE_KEY = "ec_current_user";
const STORAGE = window.sessionStorage;

export const useAuthStore = create((set) => ({
  user: null,

  setUser: (user) => {
    const normalized = normalizeUser(user);
    set({ user: normalized });

    if (normalized) {
      STORAGE.setItem(STORAGE_KEY, JSON.stringify(normalized));

      // 👇 Apply theme ONLY when logging in / setting user
      if (normalized.theme) {
        useThemeStore.getState().applyTheme(normalized.theme);
      }
    } else {
      STORAGE.removeItem(STORAGE_KEY);
      useThemeStore.getState().resetTheme(); // reset on logout
    }
  },

  loadUserFromStorage: () => {
    try {
      const raw = STORAGE.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalized = normalizeUser(parsed);
        set({ user: normalized });

        // ❌ Do NOT override theme here
        // Theme is already handled by ThemeStore from localStorage
      }
    } catch {
      /* ignore */
    }
  },

  logout: async () => {
    try {
      await fbSignOut(getAuth());
    } catch {
      // Ignore Firebase sign out errors
    }

    try {
      await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/api/users/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {
      // Ignore API logout errors
    }

    // Clear user state
    set({ user: null });

    // Clear storages
    STORAGE.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("ec_current_user");

    // 👇 Do NOT clear localStorage theme — let it persist across refresh
    // If you want to reset theme on logout, uncomment this:
    // localStorage.removeItem("theme");
    // useThemeStore.getState().resetTheme();
  },
}));
