// store/User/user.js
import { create } from "zustand";

export const useUserStore = create((set) => ({
  users: [],
  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    const res = await fetch("/api/admin/admin-users");
    const data = await res.json();
    set({ users: data.data });
  },
}));
