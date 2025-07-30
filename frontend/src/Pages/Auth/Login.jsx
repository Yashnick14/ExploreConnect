import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../Firebase";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import bgImage from "../../assets/login.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const authenticateUser = async (idToken, userInfo = null) => {
    try {
      const response = await axios.post("/api/users/auth/firebase/login", {
        idToken,
      });

      if (response.data.success) {
        const { role } = response.data.user;
        toast.success("Login successful");

        if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      const message = err?.response?.data?.message;

      // Account deactivated case
      if (err.response?.status === 403 && message?.includes("deactivated")) {
        toast.error(" Your account has been deactivated. Contact support.");
        return;
      }

      // 🔁 Attempt auto-register if user not found
      if (
        err.response?.data?.message === "User not found" &&
        userInfo !== null
      ) {
        await registerAndRetryLogin(idToken, userInfo);
      } else {
        toast.error(message || "Server error");
      }
    }
  };

  const registerAndRetryLogin = async (idToken, userInfo) => {
    try {
      const payload = {
        idToken,
        fullName: userInfo.displayName || "No Name",
        username: userInfo.displayName?.split(" ")[0]?.toLowerCase() || "user",
        phoneNumber: userInfo.phoneNumber || "N/A",
      };

      await axios.post("/api/users/auth/firebase/register", payload);

      // Retry login after register
      await authenticateUser(idToken);
    } catch (err) {
      toast.error("Registration failed: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const idToken = await userCredential.user.getIdToken();
      await authenticateUser(idToken);
    } catch (err) {
      toast.error("Email or password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await authenticateUser(idToken, result.user);
    } catch (err) {
      toast.error("Google login failed: " + err.message);
    }
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 p-10 rounded-2xl max-w-md w-full text-center shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">WELCOME BACK</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base text-black bg-white"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            value={formData.password}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base text-black bg-white"
          />

          <p className="text-xs mt-2 mb-4 text-left text-gray-700">
            FORGOT YOUR PASSWORD?{" "}
            <Link
              to="/forgot-password"
              className="underline text-black hover:text-blue-600"
            >
              CLICK HERE
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold text-base rounded-md ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black hover:bg-gray-900"
            } transition-transform`}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <div className="my-5 text-gray-500 text-sm">or</div>

        <button
          onClick={handleGoogleLogin}
          className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 w-full hover:bg-gray-100 transition"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        <p className="text-xs mt-6 text-left text-gray-700">
          CREATE NEW ACCOUNT?{" "}
          <Link
            to="/register"
            className="underline text-black hover:text-blue-600"
          >
            CLICK HERE
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
