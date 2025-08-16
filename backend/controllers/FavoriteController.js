import mongoose from "mongoose";
import Favorite from "../models/FavoritesModel.js";
import Place from "../models/PlacesModel.js";

export const listFavorites = async (req, res) => {
  try {
    const email = String(req.query.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    // return places directly (like your navbar needs)
    const favs = await Favorite.find({ userEmail: email }).populate({
      path: "place",
      select: "name district category images", // add more if you want
    });

    const places = favs
      .map((f) => f.place)
      .filter(Boolean);

    res.json({ success: true, data: places });
  } catch (err) {
    console.error("listFavorites error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { email, placeId } = req.body || {};
    if (!email || !placeId) {
      return res.status(400).json({ success: false, message: "Email and placeId required" });
    }
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, message: "Invalid placeId" });
    }

    await Favorite.findOneAndUpdate(
      { userEmail: String(email).toLowerCase().trim(), place: placeId },
      { $setOnInsert: { userEmail: String(email).toLowerCase().trim(), place: placeId } },
      { upsert: true, new: true }
    );

    const place = await Place.findById(placeId).select("name district category images");
    res.status(201).json({ success: true, data: place });
  } catch (err) {
    console.error("addFavorite error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const email = String(req.query.email || "").toLowerCase().trim();
    const placeId = String(req.query.place || "");
    if (!email || !placeId) {
      return res.status(400).json({ success: false, message: "Email and place required" });
    }
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, message: "Invalid place id" });
    }

    await Favorite.deleteOne({ userEmail: email, place: placeId });
    res.json({ success: true, message: "Removed" });
  } catch (err) {
    console.error("removeFavorite error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { email, placeId } = req.body || {};
    if (!email || !placeId) return res.status(400).json({ success: false, message: "Email and placeId required" });
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, message: "Invalid placeId" });
    }

    const doc = await Favorite.findOne({ userEmail: String(email).toLowerCase().trim(), place: placeId });
    if (doc) {
      await Favorite.deleteOne({ _id: doc._id });
      return res.json({ success: true, action: "removed" });
    } else {
      await Favorite.create({ userEmail: String(email).toLowerCase().trim(), place: placeId });
      return res.status(201).json({ success: true, action: "added" });
    }
  } catch (err) {
    console.error("toggleFavorite error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
