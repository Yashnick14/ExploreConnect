// src/Pages/Auth/ForgotPassword.jsx

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../Firebase";
import { toast } from "react-hot-toast";
import bgImage from "../../assets/login.jpg";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset link sent to your email");
    } catch (error) {
      console.error("Password reset error:", error.message);
      toast.error("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 p-10 rounded-2xl max-w-md w-full text-center shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">RESET PASSWORD</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base text-black bg-white"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold text-base rounded-md ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black hover:bg-gray-900"
            } transition-transform`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-xs mt-6 text-left text-gray-700">
          GO BACK TO LOGIN?{" "}
          <Link
            to="/login"
            className="underline text-black hover:text-blue-600"
          >
            CLICK HERE
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
