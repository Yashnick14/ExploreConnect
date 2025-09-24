// src/Pages/Auth/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../../assets/login3.jpg";
import { toast } from "react-hot-toast";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../Firebase";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");

  // ✅ Handle input changes
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ✅ Send OTP (Twilio backend)
  const sendOtp = async (phoneNumber) => {
    try {
      const response = await axios.post(`${API_BASE}/api/otp/send-otp`, {
        phoneNumber,
      });
      if (response.data.success) {
        setOtpStage(true);
        toast.success("OTP sent to your phone!");
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      toast.error("Failed to send OTP");
    }
  };

  // ✅ Handle Register form submit → only sends OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      fullName,
      username,
      phoneNumber,
      email,
      password,
      confirmPassword,
    } = formData;

    // 🔎 Validations
    if (
      !fullName ||
      !username ||
      !phoneNumber ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!/^\+94\d{9}$/.test(phoneNumber)) {
      toast.error("Phone number must be in format +94XXXXXXXXX");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password should be at least 6 characters long");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must include at least one uppercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must include at least one number");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Password must include at least one special character");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Only send OTP
      await sendOtp(phoneNumber);
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP → create Firebase + MongoDB user
  const verifyOtpAndRegister = async () => {
    try {
      // Step 1: Verify OTP with backend
      const response = await axios.post(`${API_BASE}/api/otp/verify-otp`, {
        phoneNumber: formData.phoneNumber,
        code: otp,
      });

      if (!response.data.success) {
        toast.error("Invalid OTP");
        return;
      }

      // Step 2: Create Firebase user
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(cred.user, { displayName: formData.username });

      const idToken = await cred.user.getIdToken();

      // Step 3: Save user to MongoDB
      const registerResponse = await axios.post(
        `${API_BASE}/api/users/auth/firebase/register`,
        {
          idToken,
          fullName: formData.fullName,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
        },
        { withCredentials: true }
      );

      if (registerResponse.data.success) {
        toast.success("Registration successful!");
        navigate("/login", { replace: true });
      } else {
        toast.error(registerResponse.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Verify/Register error:", err);

      // Firebase error handling
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        toast.error("Password too weak. Please choose a stronger one.");
      } else if (err.code === "auth/password-does-not-meet-requirements") {
        toast.error(
          "Password must contain an uppercase letter, a number, and a special character."
        );
      } else {
        toast.error(err.message || "Something went wrong");
      }
    }
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 p-10 rounded-2xl max-w-md w-full text-center shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          CREATE ACCOUNT
        </h2>

        {!otpStage ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number (+94...)"
              required
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-md"
            >
              {loading ? "Sending OTP..." : "REGISTER"}
            </button>
          </form>
        ) : (
          <div>
            <p className="mb-3 text-gray-800 text-sm">
              We sent an OTP to <strong>{formData.phoneNumber}</strong>.
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded-md"
            />
            <button
              onClick={verifyOtpAndRegister}
              className="w-full bg-green-600 text-white p-2 rounded-md mt-3"
            >
              Verify & Complete Registration
            </button>
          </div>
        )}

        <p className="text-xs mt-6 text-left text-gray-700">
          Already have an account?{" "}
          <Link
            to="/login"
            className="underline text-black hover:text-blue-600"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
