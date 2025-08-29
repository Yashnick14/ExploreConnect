// backend/routes/ReviewRoute.js
import express from "express";
import { createReview, getReviewsByPlace } from "../controllers/ReviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/place/:placeId", getReviewsByPlace);


export default router;
