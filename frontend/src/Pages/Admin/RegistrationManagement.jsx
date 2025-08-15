// src/Pages/Admin/RegistrationManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMenu } from "react-icons/fi";
import { useRegistrationStore } from "../../store/User/Registration";

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
  { value: "pending",   label: "Pending"   },
  { value: "approved",   label: "Approved"   },
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
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
  if (s === "completed") return "bg-green-200 text-green-700";
  if (s === "approved") return "bg-blue-200 text-blue-700";
  if (s === "cancelled") return "bg-rose-200 text-rose-700";
  return "bg-yellow-200 text-yellow-700"; // pending/default
};

/* ---------- Page ---------- */
const RegistrationManagement = () => {
  const {
    registrations,
    fetchRegistrations,
    deleteRegistration,
    updateRegistration,
  } = useRegistrationStore();

  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [placeMap, setPlaceMap] = useState({});

  useEffect(() => {
    fetchRegistrations({});
  }, [fetchRegistrations]);

  // load place names for the table
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || "";
        const res = await fetch(`${base}/api/places`);
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

  const rows = useMemo(() => registrations || [], [registrations]);
  const selectedRow = rows.find((r) => r._id === selectedId);

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
      await fetchRegistrations({}); // ensure table reflects latest DB state
    } else {
      toast.error(res?.message || "Failed to update registration");
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
            Registrations
          </h2>

          <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row w-full sm:w-auto">
            <button className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto">
              All
            </button>

            {/* EDIT (opens status modal) */}
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

            {/* DELETE */}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={!selectedId}
              className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                !selectedId ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              DELETE
            </button>
          </div>
        </div>

        {/* Table */}
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

        {showDeleteModal && (
          <DeleteConfirmModal
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
          />
        )}

        {showEditModal && selectedRow && (
          <EditStatusModal
            currentStatus={selectedRow.status || "pending"}
            onCancel={() => setShowEditModal(false)}
            onSave={handleEditSave}
            saving={savingEdit}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationManagement;
