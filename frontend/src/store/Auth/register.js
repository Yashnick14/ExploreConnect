import { create } from "zustand";
import { toast } from "react-hot-toast";
import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { app } from "../../../Firebase"; // ✅ path to your Firebase config
import axios from "axios";

export const useRegisterStore = create((set) => ({
  loading: false,

  registerUser: async ({ username, email, password, confirmPassword, fullName, phoneNumber }) => {
    if (!username || !email || !password || !confirmPassword || !fullName || !phoneNumber) {
      toast.error("Please fill in all fields");
      return { success: false };
    }

    if (password.length < 6) {
      toast.error("Password should be at least 6 characters");
      return { success: false };
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return { success: false };
    }

    set({ loading: true });
    const auth = getAuth(app);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      const idToken = await userCredential.user.getIdToken();

      const response = await axios.post("/api/users/auth/firebase/register", {
        idToken,
        username,
        fullName,
        phoneNumber,
      });

      set({ loading: false });

      if (!response.data.success) {
        toast.error(response.data.message || "Registration failed");
        return { success: false };
      }

      toast.success("Registration successful");
      return { success: true };
    } catch (error) {
      console.error("Firebase registration error:", error);
      toast.error(error.message || "Something went wrong");
      set({ loading: false });
      return { success: false };
    }
  },
}));

