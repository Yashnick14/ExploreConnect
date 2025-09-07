// backend/controllers/ReviewController.js
import Review from "../models/ReviewModel.js";
import User from "../models/UserModel.js";

export const createReview = async (req, res) => {
  try {
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
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
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
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Fetch all reviews for a place
export const getReviewsByPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const reviews = await Review.find({ place: placeId })
      .populate("user", "fullName username email avatar") // ✅ fetch user details
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
