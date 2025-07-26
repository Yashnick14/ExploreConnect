import React, { useState, useEffect } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../Firebase";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) return toast.error("Fill in both fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("✅ Password changed successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.message);
      toast.error("❌ " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleReset} style={styles.form}>
        <h2 style={styles.heading}>Reset Your Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    background: "#f3f4f6",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  heading: {
    textAlign: "center",
    fontSize: "1.5rem",
    color: "#333",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.75rem",
    fontSize: "1rem",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ResetPassword;
