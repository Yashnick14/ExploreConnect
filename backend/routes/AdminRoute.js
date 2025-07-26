// routes/AdminRoute.js
import express from "express";
import { getUsers } from "../controllers/UserController.js";

const router = express.Router();

router.get("/admin-users", getUsers);

export default router;
