import express from "express";
import { getVisitors, logVisitor } from "../controllers/PageViewController.js";

const router = express.Router();

router.get("/visitors", getVisitors);
router.post("/log", logVisitor);

export default router;
