// controllers/UserController.js
import User from "../models/UserModel.js";
import Favorite from "../models/FavoritesModel.js";
import Review from "../models/ReviewModel.js";
import Registration from "../models/RegistrationsModel.js";
import admin from "../utils/firebaseAdmin.js";

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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res
      .status(200)
      .json({ success: true, message: `User ${user.status}`, data: user });
  } catch (err) {
    console.error("Error toggling user status:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user status" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === "true"; // ensure boolean

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check membership
    const hasActiveMembership = user.membership?.isMember === true;

    // Check pending/approved registrations (case insensitive by email)
    const pendingRegs = await Registration.find({
      email: { $regex: new RegExp(`^${user.email}$`, "i") },
      status: { $in: ["pending", "approved"] },
    });

    // Return requiresConfirmation if not forced
    if ((hasActiveMembership || pendingRegs.length > 0) && !force) {
      let msg = "";
      if (hasActiveMembership) msg += "An active membership\n";
      if (pendingRegs.length > 0) {
        msg += `${pendingRegs.length} pending/approved registration(s)\n`;
      }

      return res.json({
        requiresConfirmation: true,
        message: msg.trim(), // send only the core issues
      });
    }

    // Cascade delete
    await Favorite.deleteMany({
      userEmail: { $regex: new RegExp(`^${user.email}$`, "i") },
    });
    await Review.deleteMany({ user: id });
    await Registration.deleteMany({
      email: { $regex: new RegExp(`^${user.email}$`, "i") },
    });

    await User.findByIdAndDelete(id);

    // Delete from Firebase too
    if (user.uid) {
      try {
        await admin.auth().deleteUser(user.uid);
      } catch (err) {
        console.error("Firebase delete error:", err.message);
      }
    }

    return res.json({
      success: true,
      message: "User and all related data deleted",
    });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/UserController.js
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, phoneNumber, theme, predefinedAvatar } =
      req.body;

    const updates = {};

    if (username) updates.username = username;
    if (fullName) updates.fullName = fullName;

    if (phoneNumber) {
      const phoneRegex = /^(\+94\d{9}|\d{10})$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must be 10 digits or start with +94 followed by 9 digits",
        });
      }
      updates.phoneNumber = phoneNumber;
    }

    if (theme) updates.theme = theme;

    // ✅ Case 1: user uploads their own file
    if (req.file) {
      updates.avatar = `uploads/${req.file.filename}`;
    }

    // ✅ Case 2: user selects predefined avatar
    if (predefinedAvatar) {
      // Save it as relative path so frontend can load it
      updates.avatar = predefinedAvatar; // e.g. "/avatars/horse.png"
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("❌ Error fetching user by UID:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const redeemDiscount = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if ((user.membership.points || 0) < 50) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough points to redeem" });
    }

    // ✅ Deduct points once
    user.membership.points -= 50;

    // 🎯 Random discount from 5%, 10%, 15%, 20%
    const discountOptions = [5, 10, 15, 20];
    const randomPercentage =
      discountOptions[Math.floor(Math.random() * discountOptions.length)];

    // Generate coupon code
    const coupon = `EC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    user.membership.lastRedeemed = {
      code: coupon,
      percentage: randomPercentage,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    };
    user.membership.lastRedeemedAt = new Date();

    await user.save();

    res.json({
      success: true,
      data: {
        coupon: user.membership.lastRedeemed,
        lastRedeemedAt: user.membership.lastRedeemedAt,
        remainingPoints: user.membership.points,
      },
    });
  } catch (err) {
    console.error("❌ Redeem discount error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({ "membership.isMember": true });

    res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (err) {
    console.error("❌ Get members error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
    });
  }
};
