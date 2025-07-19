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

  console.log("🔐 Received idToken:", idToken); // ✅ Step 1: Log token received from frontend

  if (!idToken) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("✅ Decoded Firebase Token:", decodedToken); // ✅ Step 2: See what's inside the token

    const { uid, email } = decodedToken;
    console.log("📧 Email from token:", email);
    console.log("🆔 UID from token:", uid);

    let user = await User.findOne({ uid });
    console.log("🧑‍💻 User found in DB:", user); // ✅ Step 3: Log user fetched from MongoDB

    if (!user) {
      console.log("❌ User not found in database.");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    console.log("🔒 Admin email from .env:", adminEmail); // ✅ Step 4: Confirm admin email match

    // Promote to admin if email matches .env and user isn't already admin
    if (email === adminEmail && user.role !== "admin") {
      user.role = "admin";
      await user.save();
      console.log("👑 Role updated to admin for:", user.email); // ✅ Step 5: Log role promotion
    }

    // ✅ Final success log
    console.log("🎉 Login successful for:", user.email);

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
      }
    });

  } catch (err) {
    console.error("🔥 Firebase Login Error:", err); // ✅ Final error fallback log
    res.status(500).json({
      success: false,
      message: err.message || "Login failed"
    });
  }
};

