// src/Pages/User/Registrations.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

import { useRegistrationStore } from "@/store/User/Registration";
import { useAuthStore } from "@/store/Auth/auth";
import { usePlaceStore } from "@/store/Place/place";
import { useReviewStore } from "@/store/User/Review";

import RegisterModal from "@/Components/RegisterModal";
import ReviewModal from "@/Components/ReviewModal";

/* ===== Cancel confirm modal ===== */
const CancelConfirmModal = ({ onCancel, onConfirm, confirming = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white shadow-xl rounded-2xl p-6 w-[360px] sm:w-[420px] border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">
        Cancel Registration
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Are you sure you want to cancel this registration? This action cannot be
        undone.
      </p>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={confirming}
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className="px-5 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
        >
          {confirming ? "Cancelling…" : "Yes, cancel"}
        </button>
      </div>
    </div>
  </div>
);

CancelConfirmModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirming: PropTypes.bool,
};

/* ===== helpers ===== */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/g, "");

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const toDDMMYYYY = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const StatusPill = ({ status }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-sm text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "pending"}
    </span>
  );
};

StatusPill.propTypes = {
  status: PropTypes.string,
};

export default function Registrations() {
  const { user, loadUserFromStorage } = useAuthStore();
  const {
    registrations,
    fetchRegistrations,
    updateRegistration,
    createEditRequest,
  } = useRegistrationStore();
  const { places, fetchPlaces } = usePlaceStore();
<<<<<<< HEAD
  const { reviews, createReview, deleteReview, fetchReviews } =
    useReviewStore();
=======
  const { createReview } = useReviewStore();
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingId, setEditingId] = useState(null);
  const [editInitial, setEditInitial] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  // Cancel modal state
  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Review modal state
  const [reviewingReg, setReviewingReg] = useState(null);

  useEffect(() => {
    loadUserFromStorage?.();
  }, [loadUserFromStorage]);

  useEffect(() => {
    (async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      await fetchRegistrations({ email: user.email });
      await fetchReviews(""); // preload reviews
      setLoading(false);
    })();
  }, [user?.email, fetchRegistrations, fetchReviews]);

  useEffect(() => {
    if (!places || places.length === 0) fetchPlaces();
  }, [places?.length, fetchPlaces]);

  const placeIndex = useMemo(() => {
    const idx = Object.create(null);
    (places || []).forEach((p) => {
      idx[p._id] = p;
    });
    return idx;
  }, [places]);

  const rows = useMemo(() => registrations || [], [registrations]);

  if (!user?.email) {
    return (
      <div className="px-6">
        <div className="max-w-6xl mx-auto min-h-[70vh] grid place-content-center text-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Registrations</h1>
            <p className="text-gray-600">
              Please log in to view your registrations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const resolveDisplay = (r) => {
    let id = null;
    let pop = null;
    if (typeof r.place === "string") id = r.place;
    else if (r.place && typeof r.place === "object") {
      id = r.place._id;
      pop = r.place;
    }

    const fromStore = id ? placeIndex[id] : null;
    const name = pop?.name ?? fromStore?.name ?? "—";
    const district = pop?.district ?? fromStore?.district;
    const imageFile = fromStore?.images?.[0] ?? pop?.images?.[0] ?? null;
    return { id, name, district, imageFile };
  };

  // Edit
  const onEdit = (r) => {
    setEditingId(r._id);
    setEditInitial({
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || "",
      date: toDDMMYYYY(r.date),
      time: r.time || "",
      people: r.people || 1,
    });
    setShowEdit(true);
  };

  const onEditSubmit = async (payload) => {
    if (!editingId) return;
    const reqPayload = {
      email: user.email,
      phone: payload.phone,
      time: payload.time,
      people: Number(payload.people || 1),
      date: payload.date,
    };

    const res = await createEditRequest(editingId, reqPayload);
    if (res?.success) {
      toast.success("Edit request submitted. Pending admin approval.");
      setShowEdit(false);
      setEditingId(null);
      setEditInitial(null);
      await fetchRegistrations({ email: user.email });
    } else {
      toast.error(res?.message || "Failed to request edit");
    }
  };

  // Cancel
  const onCancelClick = (r) => setPendingCancel(r);

  const handleConfirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      setCancelling(true);
      const res = await updateRegistration(pendingCancel._id, {
        status: "cancelled",
      });
      if (res?.success) {
        toast.success("Registration cancelled");
        await fetchRegistrations({ email: user.email });
      } else {
        toast.error(res?.message || "Failed to cancel");
      }
    } catch {
      toast.error("Failed to cancel");
    } finally {
      setCancelling(false);
      setPendingCancel(null);
    }
  };

  // Review
  const handleReviewSubmit = async (payload) => {
    if (!reviewingReg) return;

    const placeId =
      typeof reviewingReg.place === "object"
        ? reviewingReg.place._id
        : reviewingReg.place;

    const registrationId = reviewingReg._id;

    const res = await createReview({
      placeId,
      registrationId,
      userId: user._id,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      user: {
        fullName: user.fullName || user.username || user.email,
        email: user.email,
        avatar: user.avatar,
      },
    });

    if (res.success) {
      toast.success("Review submitted!");
      setReviewingReg(null);
    } else {
      toast.error(res.message || "Failed to submit review");
    }
  };

<<<<<<< HEAD
  // Delete review
  const handleDeleteReview = async (reviewId) => {
    const res = await deleteReview(reviewId, user._id);
    if (res.success) toast.success("Review deleted!");
    else toast.error(res.message || "Failed to delete review");
  };

=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 bg-white/10 backdrop-blur-sm">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Registrations</h1>
        <Link to="/places" className="text-sm text-blue-600 hover:underline">
          Browse places
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="min-w-[1080px] w-full border-separate border-spacing-y-3">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Place</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">People</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  You don’t have any registrations yet.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const info = resolveDisplay(r);
                const imgSrc = info.imageFile
                  ? `${API_BASE}/uploads/${info.imageFile}`
                  : null;
                const hasPendingEdit = !!r.pendingEdit;

                const isEditableStatus =
                  r.status === "pending" || r.status === "approved";
                const canEdit = isEditableStatus && !hasPendingEdit;
                const canCancel =
                  r.status === "pending" || r.status === "approved";
                const canReview = r.status === "completed";
<<<<<<< HEAD

                // find if this reg already has a review
                const existingReview = reviews.find(
                  (rev) =>
                    String(rev.registration) === String(r._id) &&
                    String(rev.user?._id) === String(user._id)
                );
=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407

                return (
                  <tr
                    key={r._id}
                    className="bg-white shadow-sm hover:shadow-md"
                  >
                    <td className="px-4 py-3">{idx + 1}</td>

                    <td className="px-4 py-3">
                      <Link
                        to={info.id ? `/places/${info.id}` : "#"}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 border">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={info.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:underline">
                            {info.name}
                          </div>
                          {info.district && (
                            <div className="text-xs text-gray-500">
                              {info.district}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-3">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3">{r.time || "-"}</td>
                    <td className="px-4 py-3">{r.people ?? 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusPill status={r.status} />
                        {hasPendingEdit && (
                          <span
                            className="px-2 py-1 rounded-sm text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200"
                            title="Pending approval for changes"
                          >
                            Pending approval for changes
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Edit */}
                        <button
                          onClick={() => onEdit(r)}
                          disabled={!canEdit}
                          className={`px-3 py-1.5 text-xs rounded border ${
                            canEdit
                              ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                              : "border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Edit
                        </button>

                        {/* Cancel */}
                        <button
                          onClick={() => onCancelClick(r)}
                          disabled={!canCancel}
                          className={`px-3 py-1.5 text-xs rounded border ${
                            canCancel
                              ? "border-rose-300 text-rose-700 hover:bg-rose-50"
                              : "border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Cancel
                        </button>

<<<<<<< HEAD
                        {/* Review / Delete Review */}
                        {existingReview ? (
                          <button
                            onClick={() =>
                              handleDeleteReview(existingReview._id)
                            }
                            className="px-3 py-1.5 text-xs rounded border border-rose-300 text-rose-700 hover:bg-rose-50"
                          >
                            Delete Review
                          </button>
                        ) : (
                          <button
                            onClick={() => setReviewingReg(r)}
                            disabled={!canReview}
                            className={`px-3 py-1.5 text-xs rounded border ${
                              canReview
                                ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Write Review
                          </button>
                        )}
=======
                        {/* Review */}
                        <button
                          onClick={() => setReviewingReg(r)}
                          disabled={!canReview}
                          className={`px-3 py-1.5 text-xs rounded border ${
                            canReview
                              ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                              : "border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Write Review
                        </button>
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEdit && editInitial && (
        <RegisterModal
          isOpen={showEdit}
          onClose={() => {
            setShowEdit(false);
            setEditingId(null);
            setEditInitial(null);
          }}
          onSubmit={onEditSubmit}
          initial={editInitial}
          submitLabel="Save changes"
        />
      )}

      {/* Cancel Modal */}
      {pendingCancel && (
        <CancelConfirmModal
          onCancel={() => setPendingCancel(null)}
          onConfirm={handleConfirmCancel}
          confirming={cancelling}
        />
      )}

      {/* Review Modal */}
      {reviewingReg && (
        <ReviewModal
          isOpen={!!reviewingReg}
          onClose={() => setReviewingReg(null)}
          onSubmit={handleReviewSubmit}
          placeName={resolveDisplay(reviewingReg).name}
        />
      )}
    </div>
  );
}
