import express from 'express';
import { createPlace, deletePlace, getLatestPlaces, getPlaces, updatePlace } from '../controllers/PlaceController.js';


const router = express.Router();

router.get("/", getPlaces);

router.get("/latest", getLatestPlaces);


router.post ("/", createPlace);


router.put("/:id", updatePlace)


router.delete("/:id", deletePlace);

export default router;