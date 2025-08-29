// src/store/User/Review.js
import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const api = (path) => `${API_BASE}${path}`;

// ✅ Helper: normalize avatar URLs
const normalizeReview = (review) => ({
  ...review,
  user: {
    ...review.user,
    avatar: review.user?.avatar
      ? `${API_BASE}/${review.user.avatar.replace(/^\/+/, "")}`
      : null,
  },
});

export const useReviewStore = create((set) => ({
  reviews: [],

  /* CREATE a review */
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

      console.log("📦 Review payload:", body);

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

      // 🔧 normalize avatar
      const normalized = normalizeReview(data.data);

      // add to state
      set((s) => ({ reviews: [normalized, ...s.reviews] }));

      return { success: true, data: normalized };
    } catch (err) {
      console.error("❌ createReview error:", err);
      return { success: false, message: "Server error" };
    }
  },

  /* FETCH reviews for a specific place */
  fetchReviews: async (placeId) => {
    try {
      const res = await fetch(api(`/api/reviews/place/${placeId}`));
      const data = await res.json();

      if (!res.ok || !data?.success) {
        return {
          success: false,
          message: data?.message || "Failed to fetch reviews",
        };
      }

      // 🔧 normalize all reviews
      const normalized = (data.data || []).map(normalizeReview);

      set({ reviews: normalized });
      return { success: true, data: normalized };
    } catch (err) {
      console.error("❌ fetchReviews error:", err);
      return { success: false, message: "Server error" };
    }
  },
}));
