import User from "../models/UserModel.js";
import admin from "firebase-admin";
import { createRequire } from "node:module";
import dotenv from "dotenv";

dotenv.config();

const require = createRequire(import.meta.url);
const serviceAccount = require("../firebaseServiceAccount.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// REGISTER
export const firebaseRegister = async (req, res) => {
  const { idToken, fullName, username, phoneNumber } = req.body;

  if (!idToken || !fullName || !username || !phoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // 🔑 Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing email" });
    }

    // ✅ Check duplicates
    if (await User.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered. Please log in instead.",
      });
    }

    if (await User.findOne({ phoneNumber })) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already registered. Try logging in.",
      });
    }

    // ✅ Create new MongoDB user
    const user = new User({
      uid,
      email,
      fullName,
      username,
      phoneNumber,
      role: "user",
      status: "active",
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    console.error("Firebase Register Error:", err);

    // ❌ Cleanup Firebase user if MongoDB save failed
    if (req.body.idToken) {
      try {
        const decoded = await admin.auth().verifyIdToken(req.body.idToken);
        await admin.auth().deleteUser(decoded.uid);
        console.log("🔥 Firebase user deleted due to MongoDB failure");
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
      }
    }

    res.status(500).json({
      success: false,
      message: err.message || "Registration failed",
    });
  }
};

// LOGIN
export const firebaseLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const email =
      decodedToken.email ||
      decodedToken.firebase?.identities?.["google.com"]?.[0] ||
      null;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email not found in token" });
    }

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        uid,
        email,
        fullName: decodedToken.name || "Google User",
        username: email.split("@")[0],
        phoneNumber: "",
        role: email === process.env.ADMIN_EMAIL ? "admin" : "user",
        status: "active", // Default new users to Active
      });
      await user.save();
    }

    // Promote to admin if email matches
    if (email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // Block login if user is inactive
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Account deactivated. Please contact support.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        uid: user.uid,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        theme: user.theme,
      },
    });
  } catch (err) {
    console.error("🔥 Firebase Login Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Login failed",
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    // ✅ Check if the user exists in Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    if (!userRecord) {
      return res
        .status(404)
        .json({ success: false, message: "No account with this email" });
    }

    // ✅ Generate reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email, {
      url: "https://exploreconnect-f5a02.web.app/reset-password",
      handleCodeInApp: true,
    });

    res
      .status(200)
      .json({ success: true, message: "Reset email sent", link: resetLink });
  } catch (err) {
    console.error("Forgot Password Firebase Error:", err);

    if (err.code === "auth/user-not-found") {
      return res
        .status(404)
        .json({ success: false, message: "No account with this email" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // If you were using cookies/session, clear them here
    res.clearCookie("connect.sid"); // safe to call even if not set
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};
