// src/store/User/Review.js
import { create } from "zustand";
<<<<<<< HEAD
import { normalizeUser } from "@/store/User/NormalizeUser";
=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const api = (path) => `${API_BASE}${path}`;

<<<<<<< HEAD
export const useReviewStore = create((set) => ({
  reviews: [],

  // Create Review
=======
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
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
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

<<<<<<< HEAD
=======
      console.log("📦 Review payload:", body);

>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
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

<<<<<<< HEAD
      const normalized = {
        ...data.data,
        user: normalizeUser(data.data.user),
      };

      set((s) => ({ reviews: [normalized, ...s.reviews] }));
=======
      // 🔧 normalize avatar
      const normalized = normalizeReview(data.data);

      // add to state
      set((s) => ({ reviews: [normalized, ...s.reviews] }));

>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
      return { success: true, data: normalized };
    } catch (err) {
      console.error("❌ createReview error:", err);
      return { success: false, message: "Server error" };
    }
  },

<<<<<<< HEAD
  // Fetch Reviews (Guard against missing placeId)
  fetchReviews: async (placeId) => {
    if (!placeId) {
      return { success: false, message: "Missing placeId" };
    }

=======
  /* FETCH reviews for a specific place */
  fetchReviews: async (placeId) => {
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
    try {
      const res = await fetch(api(`/api/reviews/place/${placeId}`));
      const data = await res.json();

      if (!res.ok || !data?.success) {
        return {
          success: false,
          message: data?.message || "Failed to fetch reviews",
        };
      }

<<<<<<< HEAD
      const normalized = (data.data || []).map((r) => ({
        ...r,
        user: normalizeUser(r.user),
      }));
=======
      // 🔧 normalize all reviews
      const normalized = (data.data || []).map(normalizeReview);
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

      set({ reviews: normalized });
      return { success: true, data: normalized };
    } catch (err) {
      console.error("❌ fetchReviews error:", err);
      return { success: false, message: "Server error" };
    }
  },
<<<<<<< HEAD

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
=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
}));
