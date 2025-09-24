// src/Pages/Admin/UserManagement.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Sidebar from "../../Components/Sidebar";
import { useUserStore } from "../../store/User/user";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMenu } from "react-icons/fi";
import { MdWarningAmber } from "react-icons/md";

/* ===== General Delete Modal ===== */
const GeneralDeleteModal = ({ onCancel, onConfirm, user }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
    <div className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200">
      <h2 className="text-gray-900 font-semibold text-xl">Delete User</h2>
      <p className="text-sm text-gray-600 mt-3 text-center">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{user?.fullName || user?.email}</span>?
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

GeneralDeleteModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  user: PropTypes.object,
};

/* ===== Final Delete Confirmation Modal ===== */
const DeleteConfirmModal = ({ onCancel, onConfirm, message }) => {
  // Split incoming message by newlines and filter empty lines
  const lines = (message || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200">
        {/* Circle + warning icon */}
        <div className="flex items-center justify-center p-4 bg-yellow-100 rounded-full">
          <MdWarningAmber className="w-8 h-8 text-yellow-600" />
        </div>

        <h2 className="text-gray-900 font-bold mt-4 text-xl">Warning!</h2>

        <div className="text-sm text-gray-600 mt-3 text-center">
          {lines.length > 1 ? (
            <>
              <p className="mb-2">This user has:</p>
              <ul className="text-left list-disc list-inside space-y-1">
                {lines.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
              <p className="mt-3">
                Do you still want to delete this user and all related data?
              </p>
            </>
          ) : (
            <p>{message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6 w-full">
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
};

DeleteConfirmModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

const UserManagement = () => {
  const { users, fetchUsers, toggleStatus, deleteUser } = useUserStore();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const selectedUser = users.find((u) => u._id === selectedUserId);

  const handleToggleStatus = async () => {
    if (!selectedUserId) return;
    const currentStatus = selectedUser?.status;
    const res = await toggleStatus(selectedUserId);

    if (res?.success) {
      toast.success(
        `User ${
          currentStatus === "active" ? "deactivated" : "activated"
        } successfully`
      );
      setSelectedUserId(null);
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteClick = () => {
    if (!selectedUserId) return;
    setShowGeneralModal(true); // always show first modal
  };

  const handleGeneralConfirm = async () => {
    setShowGeneralModal(false);
    const res = await deleteUser(selectedUserId, false); // force = false first

    if (res?.requiresConfirmation) {
      // 👉 open second modal
      setDeleteMessage(res.message);
      setShowDeleteModal(true);
    } else if (res?.success) {
      toast.success("User deleted successfully");
      setSelectedUserId(null);
    } else if (res?.message) {
      toast.error(res.message);
    }
  };

  const handleFinalConfirm = async () => {
    const res = await deleteUser(selectedUserId, true); // force delete
    if (res?.success) {
      toast.success("User deleted successfully");
      setSelectedUserId(null);
      setShowDeleteModal(false);
    } else {
      toast.error(res?.message || "Failed to delete user");
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden relative">
      {/* Sidebar Toggle (Mobile) */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-black bg-white shadow rounded px-3 py-2"
        >
          <FiMenu />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 h-full bg-white md:static md:block ${
          isSidebarOpen ? "block" : "hidden"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 w-full">
        <ToastContainer />

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4 sm:flex-nowrap">
          <h2 className="text-2xl font-bold w-full text-center md:text-left md:w-auto">
            Manage Users
          </h2>
          <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row w-full sm:w-auto">
            <button className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto">
              All
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={!selectedUserId}
              className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                !selectedUserId ? "bg-gray-400" : "bg-black hover:bg-gray-800"
              }`}
            >
              {selectedUser?.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={!selectedUserId}
              className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                !selectedUserId ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 bg-white shadow rounded overflow-x-auto">
          <table className="min-w-[800px] w-full border-separate border-spacing-y-3">
            <thead className="bg-[#D5F5E3] text-gray-700 text-sm">
              <tr>
                <th className="px-4 py-3 text-left">Select</th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="bg-white shadow-sm hover:shadow-md"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUserId === user._id}
                        onChange={() =>
                          setSelectedUserId(
                            selectedUserId === user._id ? null : user._id
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-200 text-green-700"
                            : "bg-yellow-200 text-yellow-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {showGeneralModal && (
          <GeneralDeleteModal
            user={selectedUser}
            onCancel={() => setShowGeneralModal(false)}
            onConfirm={handleGeneralConfirm}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmModal
            message={deleteMessage}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleFinalConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
