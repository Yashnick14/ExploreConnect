// backend/models/Review.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Ensure uniqueness per user + registration (instead of global registration)
ReviewSchema.index({ registration: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);
