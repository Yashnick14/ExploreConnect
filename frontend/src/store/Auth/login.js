// src/store/Auth/login.js
import { create } from "zustand";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase";
import axios from "axios";
import { toast } from "react-hot-toast";
import { normalizeUser } from "@/store/User/NormalizeUser";
import { useThemeStore } from "@/store/User/Theme";
import { useAuthStore } from "./auth"; // ✅ import main Auth store

axios.defaults.withCredentials = true; // send/receive session cookie

export const useLoginStore = create((set) => ({
  loading: false,

  loginUser: async ({ email, password }) => {
    set({ loading: true });

    try {
      // 1) Firebase sign-in → ID token
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      // 2) Backend login -> sets session cookie
      const res = await axios.post("/api/users/auth/firebase/login", {
        idToken,
      });

      // ✅ normalize returned user so avatar path is fixed
      const user = normalizeUser(res.data.user);

      set({ loading: false });
      toast.success("Logged in successfully");

      // ✅ Save user in Auth store (persists to localStorage too)
      useAuthStore.getState().setUser(user);

      // ✅ Apply user theme from DB immediately
      if (user.theme) {
        useThemeStore.getState().applyTheme(user.theme);
      }

      return {
        success: true,
        user,
      };
    } catch (err) {
      set({ loading: false });
      console.error("❌ Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong");
      return { success: false };
    }
  },
}));
