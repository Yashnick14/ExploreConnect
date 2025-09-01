// routes/UserRoutes.js
import express from "express";
<<<<<<< HEAD
import { upload } from "../middleware/upload.js"; // ✅ use your custom storage
import { updateUserProfile } from "../controllers/UserController.js";

const router = express.Router();
=======
import multer from "multer";
import { updateUserProfile } from "../controllers/UserController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // configure properly
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

// PUT /api/users/profile/:id
router.put("/profile/:id", upload.single("avatar"), updateUserProfile);

export default router;
