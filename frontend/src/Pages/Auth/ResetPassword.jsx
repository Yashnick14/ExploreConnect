import React, { useState, useEffect } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../Firebase";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import bgImage from "../../assets/login3.jpg";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  //Redirect if URL is invalid
  useEffect(() => {
    if (mode !== "resetPassword" || !oobCode) {
      toast.error("Invalid or expired reset link");
      navigate("/login");
    }
  }, [mode, oobCode, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success(" Password changed successfully!");
      navigate("/login", { replace: true }); // ✅ Removes oobCode from URL
    } catch (err) {
      console.error("Reset error:", err);
      if (err.code === "auth/expired-action-code") {
        toast.error("This reset link has already been used or expired.");
      } else if (err.code === "auth/invalid-action-code") {
        toast.error("Invalid reset link.");
      } else {
        toast.error("❌ " + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 p-10 rounded-2xl max-w-md w-full text-center shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          RESET YOUR PASSWORD
        </h2>

        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base text-black bg-white"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
