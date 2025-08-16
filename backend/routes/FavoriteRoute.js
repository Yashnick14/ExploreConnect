import { Router } from "express";
import { listFavorites, addFavorite, removeFavorite, toggleFavorite } from "../controllers/FavoriteController.js";

const router = Router();

// GET /api/favorites?email=...
router.get("/", listFavorites);

// POST /api/favorites { email, placeId }
router.post("/", addFavorite);

// DELETE /api/favorites?email=...&place=PLACE_ID
router.delete("/", removeFavorite);

// Optional: toggle POST /api/favorites/toggle { email, placeId }
router.post("/toggle", toggleFavorite);

export default router;
