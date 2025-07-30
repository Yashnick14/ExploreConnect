// store/User/user.js
import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  users: [],
  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    const res = await fetch("/api/admin/admin-users");
    const data = await res.json();
    set({ users: data.data });
  },

  toggleStatus: async (id) => {
    const res = await fetch(`/api/admin/admin-users/status/${id}`, { method: "PUT" });
    const data = await res.json();
    if (data.success) {
      const updatedUsers = get().users.map((user) =>
        user._id === id ? { ...user, status: data.data.status } : user
      );
      set({ users: updatedUsers });
    }
    return data;
  },

  deleteUser: async (id) => {
    const res = await fetch(`/api/admin/admin-users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      const updatedUsers = get().users.filter((u) => u._id !== id);
      set({ users: updatedUsers });
    }
    return data;
  },
}));
