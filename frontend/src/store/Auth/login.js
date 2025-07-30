import { create } from "zustand";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useLoginStore = create((set) => ({
  loading: false,

  loginUser: async ({ email, password }) => {
    set({ loading: true });

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Backend login
      const res = await axios.post("/api/users/auth/firebase/login", {
        idToken
      });

      const user = res.data.user;

      console.log("✅ Backend response:", user);

      set({ loading: false });
      toast.success("Logged in successfully");

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          phoneNumber: user.phoneNumber,
          role: user.role, 
        }
      };

    } catch (err) {
      set({ loading: false });
      console.error("❌ Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong");
      return { success: false };
    }
  },
}));
