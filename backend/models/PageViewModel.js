// backend/models/PageViewModel.js
import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema({
  path: { type: String, required: true }, // which page
  ip: String, // optional: store visitor IP
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("PageView", pageViewSchema);
