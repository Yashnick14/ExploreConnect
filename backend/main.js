import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import placeRoutes from './routes/PlaceRoute.js';
import authRoutes from './routes/AuthRoute.js';
import adminRoutes from './routes/AdminRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Handle path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Updated CORS configuration
const allowedOrigins = [
  'http://localhost:5173',        // Local frontend
  'http://localhost:5000',
  'https://exploreconnect-f5a02.web.app' // Firebase deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json()); // For JSON routes only
app.use(express.urlencoded({ extended: true }));

// Serve uploaded image files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use('/api/places', placeRoutes);
app.use('/api/users', authRoutes);
app.use('/api/admin', adminRoutes);

// Frontend serve for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
