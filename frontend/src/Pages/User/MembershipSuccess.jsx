// src/Pages/User/MembershipSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

import badgeAnimation from "../../assets/lottie/Badge.json";
import confettiAnimation from "../../assets/lottie/Confetti.json"; // 🎉 Confetti file

const MembershipSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      axios
        .get(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/stripe/session/${sessionId}`
        )
        .then(() => {
          // no need to save session details anymore
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (loading) {
    return <p className="text-center py-20">Verifying your subscription...</p>;
  }

  return (
    <div className="relative text-center py-20 space-y-8">
      {/* 🎊 Confetti Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Lottie
          animationData={confettiAnimation}
          loop={false}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* 🏅 Animated Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="flex justify-center"
      >
        <Lottie
          animationData={badgeAnimation}
          loop={false}
          style={{ width: 200 }}
        />
      </motion.div>

      {/* 🎉 Success Message */}
      <h1 className="text-3xl font-bold text-green-600">
        🎉 Welcome to Premium Membership!
      </h1>
      <p className="text-gray-600">
        You’ve unlocked access to exclusive features. Explore and enjoy!
      </p>
    </div>
  );
};

export default MembershipSuccess;
