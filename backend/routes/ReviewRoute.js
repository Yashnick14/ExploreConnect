// backend/routes/ReviewRoute.js
import express from "express";
import {
  createReview,
  deleteReview,
  getReviewsByPlace,
} from "../controllers/ReviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/place/:placeId", getReviewsByPlace);
router.delete("/:id", deleteReview);

export default router;
