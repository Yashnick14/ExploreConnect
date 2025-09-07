// src/Pages/User/Membership.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import bgImage from "../../assets/mount11.jpg";
import { useAuthStore } from "@/store/Auth/auth";
import Lottie from "lottie-react";
import unlockAnimation from "@/assets/lottie/unlock.json"; // 🔓 lock-unlock animation
import { FiCheck, FiX } from "react-icons/fi"; // ✅ Import icons

const Membership = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [dbUser, setDbUser] = useState(null);
  const [showUnlock, setShowUnlock] = useState(false);

  // ✅ Fetch user data & handle unlock animation
  useEffect(() => {
    const loadUser = async () => {
      if (!user?.uid) return;

      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/user/uid/${user.uid}` // ✅ corrected endpoint (singular)
        );

        if (res.data.success) {
          const userData = res.data.data;
          setDbUser(userData);

          // ✅ Play unlock animation only once per user
          if (userData?.membership?.isMember) {
            const playedKey = `membershipUnlockPlayed_${user.uid}`;
            const alreadyPlayed = localStorage.getItem(playedKey);

            if (!alreadyPlayed) {
              setShowUnlock(true);
              localStorage.setItem(playedKey, "true");

              // Auto-hide animation after 4s
              setTimeout(() => setShowUnlock(false), 4000);
            }
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch user from DB:", err.message);
      }
    };

    loadUser();
  }, [user?.uid]);

  // ✅ Reset unlock flag if membership is cancelled
  useEffect(() => {
    if (user?.uid && dbUser && !dbUser.membership?.isMember) {
      const playedKey = `membershipUnlockPlayed_${user.uid}`;
      localStorage.removeItem(playedKey);
      console.log("🗑️ Unlock animation reset for", playedKey);
    }
  }, [dbUser?.membership?.isMember, user?.uid]);

  // ✅ Subscribe handler
  const subscribe = async () => {
    if (!user?.uid) {
      alert("Please log in before subscribing.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/stripe/create-checkout-session`,
        { userId: user.uid, plan: "monthly" }
      );
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Stripe Checkout error:", err);
      alert("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  // ✅ If not logged in
  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Membership
        </h2>
        <p className="text-gray-600">
          Please log in to manage your membership.
        </p>
      </div>
    );
  }

  const isMember = !!dbUser?.membership?.isMember;

  return (
    <div
      className="relative py-20"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <br />
        <h1 className="text-center text-4xl font-bold text-gray-800 uppercase tracking-wide">
          Become a Member
        </h1>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center">
          {/* Free Plan */}
          <div className="flex flex-col justify-between h-full w-full max-w-sm mx-auto rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition p-8 relative">
            <div className="flex flex-col items-center text-center border-b border-gray-200 pb-6">
              <span className="text-lg font-semibold text-gray-800">Free</span>
              <span className="mt-2 text-4xl font-bold text-gray-900">
                $0<span className="text-lg font-medium">/mo</span>
              </span>
            </div>

            <ul className="mt-8 space-y-4 text-sm flex-1">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">
                  Access to ExploreConnect Basic Features
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">Registrations & Favorites</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">Reviews</span>
              </li>
              <li className="flex items-center gap-2">
                <FiX className="text-red-600" />
                <span className="text-gray-700">Exclusive Places</span>
              </li>
              <li className="flex items-center gap-2">
                <FiX className="text-red-600" />
                <span className="text-gray-700">Discounts</span>
              </li>
            </ul>

            <button
              disabled
              className="mt-8 w-full px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-600 cursor-not-allowed"
            >
              Default
            </button>
          </div>

          {/* Membership Plan */}
          <div className="flex flex-col justify-between h-full w-full max-w-sm mx-auto rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition p-8 relative">
            {/* 🔓 Unlock animation overlay */}
            {showUnlock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20 transition-opacity duration-700 ease-out">
                <Lottie
                  animationData={unlockAnimation}
                  loop={false}
                  style={{ width: 150, height: 150 }}
                />
              </div>
            )}

            {/* ✅ Badge */}
            {!showUnlock && (
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-1 rounded-full text-xs font-semibold shadow ${
                  isMember
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isMember ? "CURRENT" : "MEMBERSHIP"}
              </div>
            )}

            <div className="flex flex-col items-center text-center border-b border-gray-200 pb-6">
              <span className="text-lg font-semibold text-gray-800">
                Monthly Plan
              </span>
              <span className="mt-2 text-4xl font-bold text-gray-900">
                $2.99<span className="text-lg font-medium">/mo</span>
              </span>
            </div>

            <ul className="mt-8 space-y-4 text-sm flex-1">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">All Basic Features</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">Registrations & Favorites</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">Reviews</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">Exclusive Places</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span className="text-gray-700">Discount Coupons</span>
              </li>
            </ul>

            <button
              onClick={subscribe}
              disabled={loading || isMember}
              className={`mt-8 w-full px-6 py-2 rounded-lg font-semibold transition ${
                isMember
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isMember
                ? "SUBSCRIBED"
                : loading
                  ? "Processing..."
                  : "Subscribe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
