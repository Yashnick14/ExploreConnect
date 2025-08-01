import express from "express";
import { firebaseRegister,firebaseLogin, forgotPassword } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/auth/firebase/register", firebaseRegister);
router.post("/auth/firebase/login", firebaseLogin);
router.post("/forgot-password", forgotPassword);


export default router;
