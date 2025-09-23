// backend/routes/ReviewRoute.js
import express from "express";
import {
  createReview,
  deleteReview,
  getReviewsByPlace,
  getReviewsByUser,
} from "../controllers/ReviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/place/:placeId", getReviewsByPlace);
router.delete("/:id", deleteReview);
router.get("/user/:userId", getReviewsByUser);

export default router;
