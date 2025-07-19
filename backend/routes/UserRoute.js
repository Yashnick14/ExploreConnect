import express from "express";
import { firebaseRegister,firebaseLogin } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/auth/firebase/register", firebaseRegister);
router.post("/auth/firebase/login", firebaseLogin);

export default router;