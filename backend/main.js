import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import placeRoutes from "./routes/PlaceRoute.js";
import authRoutes from "./routes/AuthRoute.js";
import adminRoutes from "./routes/AdminRoute.js";
import registrationRoutes from "./routes/RegistrationRoute.js";
import favoritesRouter from "./routes/FavoriteRoute.js";
import reviewRoutes from "./routes/ReviewRoute.js";
import userRoutes from "./routes/UserRoute.js";
import otpRoutes from "./routes/OTPRoute.js";
import pageViewRoutes from "./routes/PageViewRoute.js";
import trackPageViews from "./middleware/TrackPageViews.js";

// Stripe
import stripeRouter from "./routes/StripeRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Handle path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Updated CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "http://localhost:5000",
  "https://exploreconnect-f5a02.web.app", // Firebase deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ---------------- Stripe webhook first ----------------
// ⚠️ RAW body parser required here ONLY
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeRouter
);

// ---------------- Normal JSON middleware ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(trackPageViews);

// Serve uploaded image files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/places", placeRoutes);
app.use("/api/users", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/favorites", favoritesRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/user", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/page-views", pageViewRoutes);

// Stripe checkout + portal routes (normal JSON body)
app.use("/api/stripe", stripeRouter);

// Frontend serve for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.get("/health", (req, res) => res.send("ok"));

app.listen(PORT, "0.0.0.0", () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
