// src/store/Auth/auth.js
import { create } from "zustand";
import axios from "axios";
import { getAuth, signOut as fbSignOut } from "firebase/auth";
import { normalizeUser } from "@/store/User/NormalizeUser";
import { useThemeStore } from "@/store/User/Theme";

const STORAGE_KEY = "ec_current_user";
const STORAGE = window.sessionStorage;

// 🚀 helper to hydrate immediately
function getInitialUser() {
  try {
    const raw = STORAGE.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeUser(parsed);
    }
  } catch {
    // Ignore errors during initial user hydration
  }
  return null;
}

export const useAuthStore = create((set) => ({
  user: getInitialUser(), // ✅ hydrate synchronously
  loadingUser: false, // ✅ no waiting

  setUser: (user) => {
    const normalized = normalizeUser(user);
    set({ user: normalized, loadingUser: false });

    if (normalized) {
      STORAGE.setItem(STORAGE_KEY, JSON.stringify(normalized));
      if (normalized.theme) {
        useThemeStore.getState().applyTheme(normalized.theme);
      }
    } else {
      STORAGE.removeItem(STORAGE_KEY);
      useThemeStore.getState().resetTheme();
    }
  },

  loadUserFromStorage: () => {
    try {
      const raw = STORAGE.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalized = normalizeUser(parsed);
        set({ user: normalized, loadingUser: false });
      } else {
        set({ user: null, loadingUser: false });
      }
    } catch {
      set({ user: null, loadingUser: false });
    }
  },

  fetchUserFromDB: async (uid) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/user/uid/${uid}`
      );
      if (res.data.success) {
        const normalized = normalizeUser(res.data.data);
        set({ user: normalized, loadingUser: false });
        STORAGE.setItem(STORAGE_KEY, JSON.stringify(normalized));
      } else {
        set({ user: null, loadingUser: false });
      }
    } catch (err) {
      console.error("❌ Failed to fetch user:", err.message);
      set({ user: null, loadingUser: false });
    }
  },

  logout: async () => {
    try {
      await fbSignOut(getAuth());
    } catch {
      // Ignore errors during logout
    }
    try {
      await axios.post(
        (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") +
          "/api/users/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {
      // Ignore errors during logout
    }

    set({ user: null, loadingUser: false });
    STORAGE.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("ec_current_user");
  },
}));
