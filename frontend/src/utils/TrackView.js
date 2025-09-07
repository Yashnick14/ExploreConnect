// src/utils/trackView.js
import axios from "axios";

export const trackView = async (path = "/home") => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/page-views/log`,
      { path }
    );
    console.log(`✅ Visitor logged for ${path}`);
  } catch (err) {
    console.error("❌ Failed to log visitor:", err.message);
  }
};
