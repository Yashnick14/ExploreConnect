// src/Pages/Admin/RegistrationManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMenu } from "react-icons/fi";
import { useRegistrationStore } from "@/store/User/Registration";

/* ---------- Confirm Delete Modal ---------- */
const DeleteConfirmModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
    <div className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200">
      <div className="flex items-center justify-center p-4 bg-red-100 rounded-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75"
            stroke="#DC2626"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-gray-900 font-semibold mt-4 text-xl">Are you sure?</h2>
      <p className="text-sm text-gray-600 mt-2 text-center">
        Do you really want to continue? This action
        <br />
        cannot be undone.
      </p>
      <div className="flex items-center justify-center gap-4 mt-5 w-full">
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full md:w-36 h-10 rounded-md text-white bg-red-600 font-medium text-sm hover:bg-red-700 active:scale-95 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

/* ---------- Edit Status Modal ---------- */
const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const EditStatusModal = ({ currentStatus = "pending", onCancel, onSave, saving = false }) => {
  const [status, setStatus] = useState(currentStatus || "pending");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white shadow-md rounded-xl p-6 w-[360px] border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Edit Registration</h2>
        <p className="text-sm text-gray-600 mt-1">Change the registration status.</p>

        <label className="block text-sm text-gray-700 mt-4 mb-1">Status</label>
        <select
          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={saving}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(status)}
            className="px-5 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Approve/Reject Modal (for Edit Requests) ---------- */
const ConfirmActionModal = ({ title, message, confirmLabel, onCancel, onConfirm, confirming = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
    <div className="bg-white shadow-md rounded-xl p-6 w-[380px] border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{message}</p>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          disabled={confirming}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-5 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
          disabled={confirming}
        >
          {confirming ? "Working…" : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ---------- helpers ---------- */
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const statusChip = (status = "") => {
  const s = status.toLowerCase();
  if (s === "completed") return "bg-green-100 text-green-700";
  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-yellow-100 text-yellow-800"; // pending/default
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/g, "");

/* ---------- Page ---------- */
const RegistrationManagement = () => {
  const { registrations, fetchRegistrations, deleteRegistration, updateRegistration } =
    useRegistrationStore();

  // view toggle
  const [view, setView] = useState("registrations"); // 'registrations' | 'editRequests'

  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [placeMap, setPlaceMap] = useState({});

  // edit-requests state
  const [editRequests, setEditRequests] = useState([]);
  const [loadingEdits, setLoadingEdits] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [modalApprove, setModalApprove] = useState(false);
  const [modalReject, setModalReject] = useState(false);
  const [acting, setActing] = useState(false);

  // badge state
  const [pendingCount, setPendingCount] = useState(0);
  const [showNewBadge, setShowNewBadge] = useState(false);

  // load registrations on mount
  useEffect(() => {
    fetchRegistrations({});
  }, [fetchRegistrations]);

  // load place names for display
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/places`);
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          const map = {};
          data.data.forEach((p) => (map[p._id] = p.name || p.title || "—"));
          setPlaceMap(map);
        }
      } catch (e) {
        console.warn("Could not load places for name mapping:", e?.message);
      }
    };
    loadPlaces();
  }, []);

  // ---- Badge: pending count loader ----
  const loadPendingCount = async () => {
    try {
      const u = new URL(`${API_BASE}/api/registrations/edit-requests`, window.location.origin);
      u.searchParams.set("status", "pending");
      const res = await fetch(u.toString().replace(window.location.origin, ""));
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setPendingCount(data.data.length);
        // show badge only when not on the editRequests view
        setShowNewBadge(view !== "editRequests" && data.data.length > 0);
      } else {
        setPendingCount(0);
        setShowNewBadge(false);
      }
    } catch {
      /* silent for badge */
    }
  };

  // Auto-refresh the badge (initial + every 15s + when tab refocuses)
  useEffect(() => {
    const tick = () => loadPendingCount();
    tick();
    const id = setInterval(tick, 15000);
    const onFocus = () => tick();
    const onVisible = () =>
      document.visibilityState === "visible" && tick();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [view]);

  // ---- Edit Requests loader ----
  const fetchEditRequests = async (status = "pending") => {
    setLoadingEdits(true);
    try {
      const u = new URL(`${API_BASE}/api/registrations/edit-requests`, window.location.origin);
      if (status) u.searchParams.set("status", status);
      const res = await fetch(u.toString().replace(window.location.origin, ""));
      const data = await res.json();
      if (data?.success) {
        setEditRequests(data.data || []);
        if (status === "pending") setPendingCount(data.data?.length || 0);
      } else {
        setEditRequests([]);
        toast.error(data?.message || "Failed to load edit requests");
      }
    } catch (e) {
      console.error("load edit-requests error:", e);
      toast.error("Failed to load edit requests");
      setEditRequests([]);
    } finally {
      setLoadingEdits(false);
    }
  };

  // When switching to the edit-requests view: fetch once, clear badge, and start an interval
  useEffect(() => {
    if (view !== "editRequests") return;

    fetchEditRequests("pending");
    setShowNewBadge(false); // admin has seen them

    const id = setInterval(() => fetchEditRequests("pending"), 15000);
    const onFocus = () => fetchEditRequests("pending");

    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [view]);

  const rows = useMemo(() => registrations || [], [registrations]);
  const selectedRow = rows.find((r) => r._id === selectedId);
  const selectedReq = editRequests.find((er) => er._id === selectedReqId);

  const handleDelete = async () => {
    if (!selectedId) return;
    const res = await deleteRegistration(selectedId);
    if (res?.success) {
      toast.success("Registration deleted");
      setSelectedId(null);
      await fetchRegistrations({});
    } else {
      toast.error(res?.message || "Failed to delete");
    }
    setShowDeleteModal(false);
  };

  const handleEditSave = async (newStatus) => {
    if (!selectedId) return;
    setSavingEdit(true);
    const res = await updateRegistration(selectedId, { status: newStatus });
    setSavingEdit(false);

    if (res?.success) {
      toast.success("Registration updated");
      setShowEditModal(false);
      await fetchRegistrations({});
    } else {
      toast.error(res?.message || "Failed to update registration");
    }
  };

  // Approve/Reject edit request
  const actOnEditRequest = async (action /* 'approve'|'reject' */) => {
    if (!selectedReqId) return;
    setActing(true);
    try {
      const res = await fetch(`${API_BASE}/api/registrations/edit-requests/${selectedReqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data?.success) {
        toast.error(data?.message || `Failed to ${action}`);
      } else {
        toast.success(`Edit ${action}d`);
        await fetchEditRequests("pending"); // refresh the list
        await fetchRegistrations({});       // keep main list in sync
        await loadPendingCount();           // update badge in case it changed
        setSelectedReqId(null);
      }
    } catch (e) {
      toast.error(`Failed to ${action}`);
    } finally {
      setActing(false);
      setModalApprove(false);
      setModalReject(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden relative">
      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-black bg-white shadow rounded px-3 py-2"
        >
          <FiMenu />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-40 h-full bg-white md:static md:block ${isSidebarOpen ? "block" : "hidden"}`}>
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 md:ml-64 p-4 w-full">
        <ToastContainer />

        {/* Top bar */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4 sm:flex-nowrap">
          <h2 className="text-2xl font-bold w-full text-center md:text-left md:w-auto">
            {view === "registrations" ? "Registrations" : "Edit Requests"}
          </h2>

          <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row w-full sm:w-auto">
            {/* View toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => setView("registrations")}
                className={`px-4 py-2 rounded text-white ${
                  view === "registrations" ? "bg-black" : "bg-black hover:bg-gray-600"
                }`}
              >
                Registrations
              </button>

              <button
                onClick={() => setView("editRequests")}
                className={`relative inline-flex items-center justify-center px-4 py-2 rounded text-white ${
                  view === "editRequests" ? "bg-black" : "bg-black hover:bg-gray-600"
                }`}
              >
                Edit Requests
                {/* Badge in corner */}
                {pendingCount > 0 && showNewBadge && (
                  <span
                    className="absolute -top-1 -right-1 grid place-items-center h-5 min-w-[1.25rem] px-1
                               rounded-full bg-red-600 text-white text-xs font-semibold
                               ring-2 ring-white shadow"
                  >
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Actions vary by view */}
            {view === "registrations" ? (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  disabled={!selectedId}
                  className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                    !selectedId ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                  }`}
                  title={!selectedId ? "Select a registration" : "Edit status"}
                >
                  EDIT
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={!selectedId}
                  className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                    !selectedId ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  DELETE
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModalApprove(true)}
                  disabled={!selectedReqId}
                  className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                    !selectedReqId ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => setModalReject(true)}
                  disabled={!selectedReqId}
                  className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                    !selectedReqId ? "bg-gray-400 cursor-not-allowed" : "bg-red-700 hover:bg-red-800"
                  }`}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {view === "registrations" ? (
          <div className="mt-6 bg-white shadow rounded overflow-x-auto">
            <table className="min-w-[980px] w-full border-separate border-spacing-y-3">
              <thead className="bg-[#D5F5E3] text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Select</th>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Registration</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">People</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r._id} className="bg-white shadow-sm hover:shadow-md">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedId === r._id}
                          onChange={() => setSelectedId(selectedId === r._id ? null : r._id)}
                          className="h-4 w-4 text-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">
                        {r.place?.name || placeMap[r.place] || placeMap[r.place?._id] || r.place || "—"}
                      </td>
                      <td className="px-4 py-3">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">{r.time || "—"}</td>
                      <td className="px-4 py-3">{r.people ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusChip(r.status)}`}>
                          {r.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow rounded overflow-x-auto">
            <table className="min-w-[1100px] w-full border-separate border-spacing-y-3">
              <thead className="bg-[#D5F5E3] text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Select</th>
                  <th className="px-4 py-3 text-left">Req ID</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Place</th>
                  <th className="px-4 py-3 text-left">Current</th>
                  <th className="px-4 py-3 text-left">Requested Change</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Requested At</th>
                </tr>
              </thead>
              <tbody>
                {loadingEdits ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : editRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      No edit requests.
                    </td>
                  </tr>
                ) : (
                  editRequests.map((er, idx) => {
                    const reg = er.registration || {};
                    const placeName =
                      reg.place?.name ||
                      placeMap[reg.place] ||
                      placeMap[reg.place?._id] ||
                      reg.place ||
                      "—";

                    const currentStr = [formatDate(reg.date), reg.time, reg.people ? `${reg.people}p` : "", reg.phone]
                      .filter(Boolean)
                      .join(" • ");

                    const patch = er.patch || {};
                    const requestedStr = [
                      patch.date || formatDate(reg.date),
                      patch.time || reg.time,
                      patch.people ? `${patch.people}p` : reg.people ? `${reg.people}p` : "",
                      patch.phone || reg.phone,
                    ]
                      .filter(Boolean)
                      .join(" • ");

                    return (
                      <tr key={er._id} className="bg-white shadow-sm hover:shadow-md">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedReqId === er._id}
                            onChange={() => setSelectedReqId(selectedReqId === er._id ? null : er._id)}
                            className="h-4 w-4 text-blue-600"
                          />
                        </td>
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{reg.name || "—"}</div>
                          <div className="text-xs text-gray-600">{reg.email || "—"}</div>
                        </td>
                        <td className="px-4 py-3">{placeName}</td>
                        <td className="px-4 py-3">{currentStr || "—"}</td>
                        <td className="px-4 py-3 font-medium">{requestedStr || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusChip(er.status)}`}>
                            {er.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDate(er.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {showDeleteModal && (
          <DeleteConfirmModal onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
        )}

        {showEditModal && selectedRow && view === "registrations" && (
          <EditStatusModal
            currentStatus={selectedRow.status || "pending"}
            onCancel={() => setShowEditModal(false)}
            onSave={handleEditSave}
            saving={savingEdit}
          />
        )}

        {modalApprove && selectedReq && (
          <ConfirmActionModal
            title="Approve Edit Request"
            message="This will update the user's registration with the requested changes."
            confirmLabel="Approve"
            onCancel={() => setModalApprove(false)}
            onConfirm={() => actOnEditRequest("approve")}
            confirming={acting}
          />
        )}

        {modalReject && selectedReq && (
          <ConfirmActionModal
            title="Reject Edit Request"
            message="This will notify the user that the edit was rejected."
            confirmLabel="Reject"
            onCancel={() => setModalReject(false)}
            onConfirm={() => actOnEditRequest("reject")}
            confirming={acting}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationManagement;
