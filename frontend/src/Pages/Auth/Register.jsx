import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import app from "../../Firebase";
import axios from "axios";
import { toast } from "react-hot-toast";
import bgImage from "../../assets/login.jpg"; // ✅ use same background image as login

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

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const firebaseUid = userCredential.user.uid; // ✅ Get UID

      const response = await axios.post("/api/users/auth/firebase/register", {
        idToken,
        fullName,
        username,
        phoneNumber,
        firebaseUid, // ✅ Send UID to backend
      });

      if (response.data.success) {
        toast.success("Registration successful!");
        setTimeout(() => {
          navigate("/login");
        }, 3000); // ⏳ 3 seconds
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
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
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 p-10 rounded-2xl max-w-md w-full text-center shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">CREATE ACCOUNT</h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-black bg-white"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-black bg-white"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-black bg-white"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-black bg-white"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-black bg-white"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-black bg-white"
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
            {loading ? "Registering..." : "REGISTER"}
          </button>
        </form>

        <p className="text-xs mt-6 text-left text-gray-700">
          ALREADY HAVE AN ACCOUNT?{" "}
          <Link to="/login" className="underline text-black hover:text-blue-600">
            LOGIN HERE
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
