// routes/UserRoutes.js
import express from "express";
import { upload } from "../middleware/upload.js"; // ✅ use your custom storage
import {
  getUserByUid,
  updateUserProfile,
  redeemDiscount,
  getAllMembers,
} from "../controllers/UserController.js";

const router = express.Router();

// PUT /api/users/profile/:id
router.put("/profile/:id", upload.single("avatar"), updateUserProfile);
router.get("/uid/:uid", getUserByUid);
router.post("/redeem", redeemDiscount);
router.get("/members", getAllMembers);

export default router;
