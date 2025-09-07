// src/Components/User/MembershipModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { FaCrown } from "react-icons/fa";

const MembershipModal = ({
  isOpen,
  onClose,
  user,
  points,
  expiryDate,
  fetchUserFromDB,
  fetchRegistrations,
}) => {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [discount, setDiscount] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  if (!isOpen && !showDiscountModal) return null;

  // Cancel Membership
  const handleCancelMembership = async () => {
    if (!user?.uid) return toast.error("User not found");
    try {
      setCancelLoading(true);
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/stripe/cancel-subscription`,
        { userId: user.uid }
      );

      if (res.data.success) {
        toast.success("Membership cancelled!");
        await fetchUserFromDB(user.uid);
        await fetchRegistrations({ email: user.email });
        onClose();
      } else {
        toast.error(res.data.error || "Failed to cancel membership");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Error cancelling membership");
    } finally {
      setCancelLoading(false);
    }
  };

  // Redeem Points
  const handleRedeem = async () => {
    if (points < 50) {
      return toast.error("You need at least 50 points to redeem a discount!");
    }
    try {
      setRedeemLoading(true);
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/user/redeem`,
        { userId: user._id }
      );

      if (res.data.success) {
        const { coupon, lastRedeemedAt, remainingPoints } = res.data.data;

        setDiscount({
          percentage: coupon.percentage,
          validUntil: new Date(coupon.validUntil).toLocaleDateString(),
          coupon: coupon.code,
          redeemedAt: new Date(lastRedeemedAt).toLocaleDateString(),
          remainingPoints: remainingPoints ?? 0,
        });

        // ✅ Close membership modal first
        onClose();

        // ✅ Open discount modal after short delay
        setTimeout(() => {
          setShowDiscountModal(true);
        }, 300);

        toast.success(`🎉 You received ${coupon.percentage}% discount!`);
        await fetchUserFromDB(user.uid);
      } else {
        toast.error(res.data.message || "Failed to redeem points");
      }
    } catch (err) {
      console.error("Redeem error:", err.message);
      toast.error("Error redeeming points");
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <>
      {/* Main Membership Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>

              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <FaCrown className="text-4xl text-yellow-400 mb-2" />
                <h2 className="text-2xl font-bold text-green-700">
                  Membership Details
                </h2>
              </div>

              {/* Membership Info */}
              <div className="space-y-4 text-center">
                <p className="text-base">
                  <span className="font-medium text-gray-700">
                    Expiry Date:
                  </span>{" "}
                  <span className="text-gray-600">{expiryDate || "N/A"}</span>
                </p>
                <p className="text-base">
                  <span className="font-medium text-gray-700">Points:</span>{" "}
                  <span className="text-green-600 font-semibold">{points}</span>
                </p>
              </div>

              {/* Redeem Section */}
              <div className="mt-8 flex flex-col items-center">
                <button
                  onClick={handleRedeem}
                  disabled={redeemLoading || points < 50}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                    points >= 50
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {redeemLoading ? "Processing..." : "Redeem Discount"}
                </button>
                {points < 50 && (
                  <p className="text-xs text-gray-500 mt-2">
                    * You need at least 50 points to redeem
                  </p>
                )}
              </div>

              {/* Cancel Membership */}
              <div className="mt-6 flex flex-col items-center">
                <button
                  onClick={handleCancelMembership}
                  disabled={cancelLoading}
                  className="w-full px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 transition"
                >
                  {cancelLoading ? "Cancelling..." : "Cancel Membership"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {showDiscountModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 w-[340px] relative text-center"
            >
              <button
                onClick={() => setShowDiscountModal(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold text-green-700 mb-4">
                🎉 You received {discount?.percentage}% discount!
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Valid until:{" "}
                <span className="font-medium">{discount?.validUntil}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Redeemed on:{" "}
                <span className="font-medium">{discount?.redeemedAt}</span>
              </p>

              <p className="text-sm text-gray-700 mt-4">
                Coupon Code:{" "}
                <span className="font-bold text-indigo-600">
                  {discount?.coupon}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Use this code at the entrance
              </p>

              <p className="text-xs text-gray-400 mt-3">
                (50 points have been deducted. Remaining:{" "}
                <span className="font-bold text-green-600">
                  {discount?.remainingPoints ?? 0}
                </span>
                )
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ✅ PropTypes
MembershipModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    uid: PropTypes.string,
    _id: PropTypes.string,
    email: PropTypes.string,
  }),
  points: PropTypes.number.isRequired,
  expiryDate: PropTypes.string,
  fetchUserFromDB: PropTypes.func.isRequired,
  fetchRegistrations: PropTypes.func.isRequired,
};

export default MembershipModal;
