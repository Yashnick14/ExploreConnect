import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import app from "../../Firebase";
import axios from "axios";
import { toast } from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, username, phoneNumber, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Firebase Registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Send to Backend
      const response = await axios.post("/api/users/auth/firebase/register", {
        idToken,
        fullName,
        username,
        phoneNumber,
      });

      if (response.data.success) {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);

      // Handle Firebase Duplicate Email
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already exists");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-400 px-4 animate-fade-in">
    <div className="flex flex-col items-center w-full max-w-md space-y-6">
      <h2 className="text-white text-3xl md:text-4xl font-bold text-center mt-10">
        EXPLORE WITH <span className="text-white">EXPLORECONNECT</span>
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full flex flex-col gap-5 animate-fade-in-up"
      >
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          required
          onChange={handleChange}
          className="p-3 rounded-md border border-gray-300 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          onChange={handleChange}
          className="p-3 rounded-md border border-gray-300 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          required
          onChange={handleChange}
          className="p-3 rounded-md border border-gray-300 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
          className="p-3 rounded-md border border-gray-300 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
          className="p-3 rounded-md border border-gray-300 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          onChange={handleChange}
          className="p-3 rounded-md border border-gray-300 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`py-3 rounded-md font-semibold text-white transition-all duration-200 ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  </div>
);

};

export default Register;
