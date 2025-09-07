// backend/routes/stripe.routes.js
import express from "express";
import {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  getSession,
  handleWebhook,
  getRevenue,
} from "../controllers/StripeController.js";

const router = express.Router();

// Webhook (raw body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Normal API routes
router.post("/create-checkout-session", createCheckoutSession);
router.post("/create-portal-session", createPortalSession);
router.post("/cancel-subscription", cancelSubscription);
router.get("/session/:id", getSession);
router.get("/revenue", getRevenue);

export default router;
