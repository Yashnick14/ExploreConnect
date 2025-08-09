import express from 'express';
import { createPlace, deletePlace, getLatestPlaces, getPlaceById, getPlaces, getUniqueFilters, searchPlaces, updatePlace } from '../controllers/PlaceController.js';
import { upload } from "../middleware/upload.js";


const router = express.Router();

router.get("/", getPlaces);

router.get("/latest", getLatestPlaces);

router.post("/", upload.fields([{ name: "images", maxCount: 4 }]), createPlace);

router.put("/:id", upload.fields([{ name: "images", maxCount: 4 }]), updatePlace);

router.delete("/:id", deletePlace);

router.get("/filters", getUniqueFilters);

router.get("/search", searchPlaces);

router.get('/:id', getPlaceById);




export default router;