import { create } from "zustand";

const STORAGE_KEY = "ec_current_user";

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  },
  loadUserFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) set({ user: JSON.parse(raw) });
    } catch {}
  },
  logout: () => {
    set({ user: null });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
