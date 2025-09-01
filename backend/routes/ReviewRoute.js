// backend/routes/ReviewRoute.js
import express from "express";
<<<<<<< HEAD
import {
  createReview,
  deleteReview,
  getReviewsByPlace,
} from "../controllers/ReviewController.js";
=======
import { createReview, getReviewsByPlace } from "../controllers/ReviewController.js";
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

const router = express.Router();

router.post("/", createReview);
router.get("/place/:placeId", getReviewsByPlace);
<<<<<<< HEAD
router.delete("/:id", deleteReview);
=======

>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

export default router;
