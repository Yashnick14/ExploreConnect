import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true, lowercase: true, trim: true },
    place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
  },
  { timestamps: true }
);

// Prevent duplicates per user/place
FavoriteSchema.index({ userEmail: 1, place: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", FavoriteSchema);
export default Favorite;
