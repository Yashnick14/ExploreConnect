// src/Pages/User/Registrations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

import { useRegistrationStore } from "@/store/User/Registration";
import { useAuthStore } from "@/store/Auth/auth";
import { usePlaceStore } from "@/store/Place/place";
import RegisterModal from "@/Components/RegisterModal";

/* ===== Cancel confirm modal (styled like the Edit modal) ===== */
const CancelConfirmModal = ({ onCancel, onConfirm, confirming = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white shadow-xl rounded-2xl p-6 w-[360px] sm:w-[420px] border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Cancel Registration</h2>
      <p className="text-sm text-gray-600 mt-1">
        Are you sure you want to cancel this registration? This action cannot be undone.
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

/* ===== helpers ===== */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/g, "");

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
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
    <span className={`px-2 py-1 rounded-sm text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status || "pending"}
    </span>
  );
};

export default function Registrations() {
  const { user, loadUserFromStorage } = useAuthStore();
  const {
    registrations,
    fetchRegistrations,
    updateRegistration, // used to set status: "cancelled"
    createEditRequest,
  } = useRegistrationStore();
  const { places, fetchPlaces } = usePlaceStore();

  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingId, setEditingId] = useState(null);
  const [editInitial, setEditInitial] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  // Cancel modal state
  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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
      setLoading(false);
    })();
  }, [user?.email, fetchRegistrations]);

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
              <p className="text-gray-600">Please log in to view your registrations.</p>
            </div>
          </div>
        </div>
      );
    }

  const resolveDisplay = (r) => {
    let id = null,
      pop = null;
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

  // Open edit modal with prefilled values
  const onEdit = (r) => {
    setEditingId(r._id);
    setEditInitial({
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || "",
      date: toDDMMYYYY(r.date), // dd/MM/yyyy
      time: r.time || "",
      people: r.people || 1,
    });
    setShowEdit(true);
  };

  // Submit edit -> create pending request (user flow)
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

  // Open cancel modal
  const onCancelClick = (r) => setPendingCancel(r);

  // Confirm cancel action -> set status to "cancelled"
  const handleConfirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      setCancelling(true);
      const res = await updateRegistration(pendingCancel._id, { status: "cancelled" });
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 bg-gray-100">
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
                <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                  You don’t have any registrations yet.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const info = resolveDisplay(r);
                const imgSrc = info.imageFile ? `${API_BASE}/uploads/${info.imageFile}` : null;
                const hasPendingEdit = !!r.pendingEdit;

                // Edit only for pending/approved and no existing pending edit
                const isEditableStatus = r.status === "pending" || r.status === "approved";
                const canEdit = isEditableStatus && !hasPendingEdit;

                // Cancel only for pending/approved
                const canCancel = r.status === "pending" || r.status === "approved";

                return (
                  <tr key={r._id} className="bg-white shadow-sm hover:shadow-md">
                    <td className="px-4 py-3">{idx + 1}</td>

                    <td className="px-4 py-3">
                      <Link to={info.id ? `/places/${info.id}` : "#"} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 border">
                          {imgSrc ? (
                            <img src={imgSrc} alt={info.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:underline">{info.name}</div>
                          {info.district && <div className="text-xs text-gray-500">{info.district}</div>}
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
                            title={`Requested: ${r.pendingEdit?.patch?.date || toDDMMYYYY(r.date)} • ${
                              r.pendingEdit?.patch?.time || r.time
                            } • ${r.pendingEdit?.patch?.people || r.people} • ${
                              r.pendingEdit?.patch?.phone || r.phone
                            }`}
                          >
                            Pending approval for changes
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(r)}
                          disabled={!canEdit}
                          className={`px-3 py-1.5 text-xs rounded border ${
                            canEdit
                              ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                              : "border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            hasPendingEdit
                              ? "Edit request already pending"
                              : isEditableStatus
                              ? "Edit"
                              : "Editing only allowed for Pending or Approved"
                          }
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onCancelClick(r)}
                          disabled={!canCancel}
                          className={`px-3 py-1.5 text-xs rounded border ${
                            canCancel
                              ? "border-rose-300 text-rose-700 hover:bg-rose-50"
                              : "border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            canCancel
                              ? "Cancel this registration"
                              : "Cancellation not allowed once Completed or already Cancelled"
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal (prefilled → creates pending edit request) */}
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
        <CancelConfirmModal onCancel={() => setPendingCancel(null)} onConfirm={handleConfirmCancel} confirming={cancelling} />
      )}
    </div>
  );
}
