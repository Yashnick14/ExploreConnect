// backend/controllers/ReviewController.js
import Review from "../models/ReviewModel.js";
import User from "../models/UserModel.js";

export const createReview = async (req, res) => {
  try {
<<<<<<< HEAD
    const { placeId, registrationId, userId, rating, title, comment } =
      req.body;

    if (
      !placeId ||
      !registrationId ||
      !userId ||
      !rating ||
      !title ||
      !comment
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
=======
    const { placeId, registrationId, userId, rating, title, comment } = req.body;

    if (!placeId || !registrationId || !userId || !rating || !title || !comment) {
      return res.status(400).json({ success: false, message: "All fields are required" });
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
<<<<<<< HEAD
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const existing = await Review.findOne({
      place: placeId,
      registration: registrationId,
      user: userId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this place." });
=======
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existing = await Review.findOne({ place: placeId, registration: registrationId, user: userId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You already reviewed this place." });
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
    }

    const review = new Review({
      place: placeId,
      registration: registrationId,
      user: userId,
      rating,
      title,
      comment,
    });

    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error("❌ Error creating review:", err);
<<<<<<< HEAD
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

=======
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
// Fetch all reviews for a place
export const getReviewsByPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const reviews = await Review.find({ place: placeId })
<<<<<<< HEAD
      .populate("user", "fullName username email avatar") // ✅ fetch user details
=======
      .populate("user", "fullName username email") // ✅ fetch user details
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
<<<<<<< HEAD

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // review id
    const { userId } = req.body; // current user id (from frontend)

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (String(review.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await review.deleteOne();
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting review:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
