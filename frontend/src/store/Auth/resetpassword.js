import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useResetPasswordStore = create((set) => ({
  loading: false,

  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    if (!newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    set({ loading: true });

    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      set({ loading: false });

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("Password updated successfully");
    } catch (err) {
      set({ loading: false });
      toast.error("Something went wrong");
    }
  },
}));
