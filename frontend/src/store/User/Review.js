// src/store/User/Review.js
import { create } from "zustand";
import { normalizeUser } from "@/store/User/NormalizeUser";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const api = (path) => `${API_BASE}${path}`;

export const useReviewStore = create((set) => ({
  reviews: [],

  // Create Review
  createReview: async (payload) => {
    try {
      const body = {
        placeId: payload.placeId,
        registrationId: payload.registrationId,
        userId: payload.userId,
        rating: payload.rating,
        title: payload.title,
        comment: payload.comment,
      };

      const res = await fetch(api("/api/reviews"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        return {
          success: false,
          message: data?.message || "Failed to create review",
        };
      }

      const normalized = {
        ...data.data,
        user: normalizeUser(data.data.user),
      };

      set((s) => ({ reviews: [normalized, ...s.reviews] }));
      return { success: true, data: normalized };
    } catch (err) {
      console.error("❌ createReview error:", err);
      return { success: false, message: "Server error" };
    }
  },

  // Fetch Reviews (Guard against missing placeId)
  fetchReviews: async (placeId, userId) => {
    try {
      let url;
      if (placeId) {
        url = api(`/api/reviews/place/${placeId}`);
      } else if (userId) {
        url = api(`/api/reviews/user/${userId}`);
      } else {
        return { success: false, message: "Missing placeId or userId" };
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data?.success) {
        return {
          success: false,
          message: data?.message || "Failed to fetch reviews",
        };
      }

      const normalized = (data.data || []).map((r) => ({
        ...r,
        user: normalizeUser(r.user),
      }));

      set({ reviews: normalized });
      return { success: true, data: normalized };
    } catch (err) {
      console.error("❌ fetchReviews error:", err);
      return { success: false, message: "Server error" };
    }
  },

  // Delete Review
  deleteReview: async (reviewId, userId) => {
    try {
      const res = await fetch(api(`/api/reviews/${reviewId}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // ensure ownership
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        return {
          success: false,
          message: data?.message || "Failed to delete review",
        };
      }

      set((s) => ({
        reviews: s.reviews.filter((r) => r._id !== reviewId),
      }));

      return { success: true };
    } catch (err) {
      console.error("❌ deleteReview error:", err);
      return { success: false, message: "Server error" };
    }
  },
}));
