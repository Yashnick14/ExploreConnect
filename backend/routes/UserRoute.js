// routes/UserRoutes.js
import express from "express";
import { upload } from "../middleware/upload.js"; // ✅ use your custom storage
import { updateUserProfile } from "../controllers/UserController.js";

const router = express.Router();

// PUT /api/users/profile/:id
router.put("/profile/:id", upload.single("avatar"), updateUserProfile);

export default router;
