import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import { useUserStore } from "../../store/User/user";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserManagement = () => {
  const { users, fetchUsers, toggleStatus, deleteUser } = useUserStore();
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async () => {
    if (!selectedUserId) return;
    const selectedUser = users.find((u) => u._id === selectedUserId);
    const currentStatus = selectedUser?.status;

    const res = await toggleStatus(selectedUserId);
    if (res?.success) {
      toast.success(`User ${currentStatus === "active" ? "deactivated" : "activated"} successfully`);
      setSelectedUserId(null);
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      const res = await deleteUser(selectedUserId);
      if (res?.success) {
        toast.success("User deleted successfully");
        setSelectedUserId(null);
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <ToastContainer />
      <div className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <div className="space-x-2">
            <button className="bg-black text-white px-4 py-2 rounded">All</button>
            <button
              onClick={handleToggleStatus}
              disabled={!selectedUserId}
              className={`px-4 py-2 rounded text-white ${
                !selectedUserId ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {users.find((u) => u._id === selectedUserId)?.status === "active"
                ? "Deactivate"
                : "Activate"}
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedUserId}
              className={`px-4 py-2 rounded text-white ${
                !selectedUserId ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white mt-6">
          <table className="min-w-full border-separate border-spacing-y-3">
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
                  <tr key={user._id} className="bg-white shadow-sm hover:shadow-md">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUserId === user._id}
                        onChange={() =>
                          setSelectedUserId(selectedUserId === user._id ? null : user._id)
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
      </div>
    </div>
  );
};

export default UserManagement;
