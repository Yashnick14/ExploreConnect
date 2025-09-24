import { create } from "zustand";
import { toast } from "react-hot-toast";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import app from "../../Firebase";
import axios from "axios";

axios.defaults.withCredentials = true;

export const useRegisterStore = create((set) => ({
  loading: false,

  registerUserAfterOtp: async ({
    username,
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
  }) => {
    // 🔎 Frontend validations before Firebase call
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !fullName ||
      !phoneNumber
    ) {
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

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      return { success: false };
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number");
      return { success: false };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Password must contain at least one special character");
      return { success: false };
    }

    set({ loading: true });
    const firebaseAuth = getAuth(app);

    try {
      // ✅ Create Firebase account
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName: username });

      const idToken = await userCredential.user.getIdToken();

      // ✅ Save user to backend MongoDB
      const response = await axios.post("/api/users/auth/firebase/register", {
        idToken,
        username,
        fullName,
        phoneNumber,
      });

      if (!response.data.success) {
        // ❌ If MongoDB failed → delete Firebase user
        await deleteUser(userCredential.user);
        toast.error(response.data.message || "Registration failed");
        set({ loading: false });
        return { success: false };
      }

      toast.success("Registration successful!");
      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error("Firebase registration error:", error);

      // 🔥 Firebase-specific error handling
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("The email address is invalid.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger one.");
      } else if (error.code === "auth/password-does-not-meet-requirements") {
        toast.error(
          "Password must contain an uppercase letter, a number, and a special character."
        );
      } else {
        toast.error(error.message || "Something went wrong. Please try again.");
      }

      set({ loading: false });
      return { success: false };
    }
  },
}));
