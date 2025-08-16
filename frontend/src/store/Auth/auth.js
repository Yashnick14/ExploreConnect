import { create } from "zustand";
import axios from "axios";
import { getAuth, signOut as fbSignOut } from "firebase/auth";

const STORAGE_KEY = "ec_current_user";
// Use sessionStorage so each tab has its own copy of user state.
const STORAGE = window.sessionStorage;

export const useAuthStore = create((set) => ({
  user: null,

  setUser: (user) => {
    set({ user });
    if (user) STORAGE.setItem(STORAGE_KEY, JSON.stringify(user));
    else STORAGE.removeItem(STORAGE_KEY);
  },

  loadUserFromStorage: () => {
    try {
      const raw = STORAGE.getItem(STORAGE_KEY);
      if (raw) set({ user: JSON.parse(raw) });
    } catch {/* ignore */}
  },

  logout: async () => {
    // 1) Firebase sign out (clears client auth)
    try { await fbSignOut(getAuth()); } catch {}

    // 2) Clear backend session cookie if you added the session endpoint
    try {
      await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/api/users/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {}

    // 3) Clear local state
    set({ user: null });
    STORAGE.removeItem(STORAGE_KEY);
  },
}));
