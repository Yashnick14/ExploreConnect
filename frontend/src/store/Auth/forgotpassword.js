import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useForgotPasswordStore = create((set) => ({
  loading: false,

  sendResetLink: async (email) => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    set({ loading: true });

    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      set({ loading: false });

      if (!data.success) {
        toast.error(data.message || "Reset failed");
        return;
      }

      toast.success(data.message || "Reset link sent to your email");
    } catch (err) {
      set({ loading: false });
      toast.error("Something went wrong. Please try again.");
    }
  },
}));
