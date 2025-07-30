// routes/AdminRoute.js
import express from "express";
import { deleteUser, getUsers, toggleUserStatus } from "../controllers/UserController.js";

const router = express.Router();

router.get("/admin-users", getUsers);

router.put("/admin-users/status/:id", toggleUserStatus); 

router.delete("/admin-users/:id", deleteUser); 

export default router;
