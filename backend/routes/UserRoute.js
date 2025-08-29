// routes/UserRoutes.js
import express from "express";
import multer from "multer";
import { updateUserProfile } from "../controllers/UserController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // configure properly

// PUT /api/users/profile/:id
router.put("/profile/:id", upload.single("avatar"), updateUserProfile);

export default router;
