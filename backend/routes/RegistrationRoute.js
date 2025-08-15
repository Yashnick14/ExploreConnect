// routes/RegistrationRoute.js
import express from "express";
import {
  createRegistration,
  listRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} from "../controllers/RegistrationController.js";

const router = express.Router();

// Create a registration
router.post("/", createRegistration);

// List registrations (optionally filter by place: ?place=<placeId>)
router.get("/", listRegistrations);

// Get single registration
router.get("/:id", getRegistrationById);

// Update a registration
router.patch("/:id", updateRegistration);

// Delete a registration
router.delete("/:id", deleteRegistration);

export default router;
