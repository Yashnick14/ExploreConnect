// controllers/UserController.js
import User from "../models/UserModel.js";
import admin from '../utils/firebaseAdmin.js'; 

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }); // filter only regular users
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("Error in fetching users:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.status(200).json({ success: true, message: `User ${user.status}`, data: user });
  } catch (err) {
    console.error("Error toggling user status:", err.message);
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const firebaseUid = user.uid;

    // Delete from MongoDB
    await User.findByIdAndDelete(id);

    // Delete from Firebase Auth
    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
      } catch (firebaseError) {
        console.error("❌ Error deleting from Firebase:", firebaseError.message);
        // Optional: Reinsert MongoDB user if Firebase deletion fails
      }
    } else {
      console.warn("⚠️ No Firebase UID found, skipping Firebase deletion");
    }

    res.status(200).json({ success: true, message: "User deleted from DB and Firebase" });
  } catch (err) {
    console.error("❌ General error in deleteUser:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};


