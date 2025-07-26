// controllers/UserController.js
import User from "../models/UserModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }); // filter only regular users
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("Error in fetching users:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


