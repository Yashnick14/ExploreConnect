import User from '../models/UserModel.js';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
const serviceAccount = require('../firebaseServiceAccount.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

//REGISTER
export const firebaseRegister = async (req, res) => {
  const { idToken, fullName, username, phoneNumber } = req.body;

  if (!idToken || !fullName || !username || !phoneNumber) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    let user = await User.findOne({ uid });
    if (user) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    user = new User({ uid, email, fullName, username,  phoneNumber });
    await user.save();

    res.status(201).json({ success: true, message: "User registered", user });
  } catch (err) {
    console.error("Firebase Register Error:", err);
    res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
};

// LOGIN
export const firebaseLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // ✅ Fix here: fallback to Google identity if no email
    const uid = decodedToken.uid;
    const email =
      decodedToken.email ||
      decodedToken.firebase?.identities?.["google.com"]?.[0] ||
      null;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email not found in token" });
    }

    let user = await User.findOne({ uid });

    // ✅ Auto-register if not found
    if (!user) {
      user = new User({
        uid,
        email,
        fullName: decodedToken.name || "Google User",
        username: email.split("@")[0],
        phoneNumber: "",
        role: email === process.env.ADMIN_EMAIL ? "admin" : "user",
      });
      await user.save();
      console.log("🆕 User auto-registered:", user.email);
    }

    // ✅ Promote to admin if matches
    if (email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
      console.log("👑 Role upgraded to admin for:", email);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        uid: user.uid,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
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
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // ✅ Check if the user exists in Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    if (!userRecord) {
      return res.status(404).json({ success: false, message: "No account with this email" });
    }

    // ✅ Generate reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // For now, just log it or return it — or ideally, send via your own email system
    console.log("Reset Link:", resetLink);

    res.status(200).json({ success: true, message: "Reset email sent", link: resetLink });
  } catch (err) {
    console.error("Forgot Password Firebase Error:", err);

    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ success: false, message: "No account with this email" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

