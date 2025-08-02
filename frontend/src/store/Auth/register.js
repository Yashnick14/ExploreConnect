import { create } from "zustand";
import { toast } from "react-hot-toast";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import app, { auth } from "../../Firebase";
import axios from "axios";


export const useRegisterStore = create((set) => ({
  loading: false,

  registerUser: async ({
    username,
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
  }) => {
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

    return { success: true };
  } catch (error) {
    console.error("Firebase registration error:", error);

    // 🔥 Custom error messages
    if (error.code === "auth/email-already-in-use") {
      toast.error("This email is already registered.");
    } else if (error.code === "auth/invalid-email") {
      toast.error("The email address is invalid.");
    } else if (error.code === "auth/weak-password") {
      toast.error("Password is too weak. Please choose a stronger one.");
    } else if (error.code === "auth/password-does-not-meet-requirements") {
      toast.error("Password must contain an uppercase letter, a number, and a special character.");
    } else {
      toast.error("Something went wrong. Please try again.");
    }

    set({ loading: false });
    return { success: false };
  }
  },
}));
