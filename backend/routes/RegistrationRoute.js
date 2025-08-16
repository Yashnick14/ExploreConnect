// routes/RegistrationRoute.js
import express from "express";
import {
  createRegistration,
  listRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
  createEditRequest,
  listEditRequests,
  actOnEditRequest,
} from "../controllers/RegistrationController.js";

const router = express.Router();

// Create a registration
router.post("/", createRegistration);

// List registrations 
router.get("/", listRegistrations);

// user creates a pending edit request
router.post("/:id/edit-requests", createEditRequest);

// admin/user lists edit requests  
router.get("/edit-requests", listEditRequests);

// admin approves/rejects an edit request
router.patch("/edit-requests/:rid", actOnEditRequest);

// Get single registration
router.get("/:id", getRegistrationById);

// Update a registration (admin / system)
router.patch("/:id", updateRegistration);

// Delete a registration
router.delete("/:id", deleteRegistration);

export default router;
