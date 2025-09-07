// src/Pages/Admin/MembershipManagement.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiMenu } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const MembershipManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🔹 Fetch only members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/user/members`);
      if (res.data.success) {
        setMembers(res.data.members);
      } else {
        toast.error(res.data.message || "Failed to fetch members");
      }
    } catch (err) {
      console.error("Fetch members error:", err);
      toast.error("Something went wrong while fetching members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 🔹 Cancel subscription
  const cancelMembership = async (userId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/stripe/cancel-subscription`,
        { userId }
      );
      if (res.data.success) {
        toast.success("Membership cancelled successfully!");
        fetchMembers();
      } else {
        toast.error(res.data.message || "Failed to cancel membership");
      }
    } catch (err) {
      console.error("Cancel membership error:", err);
      toast.error("Something went wrong while cancelling membership");
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
        <h2 className="text-2xl font-bold mb-4">Manage Members</h2>

        {loading ? (
          <p>Loading members...</p>
        ) : (
          <div className="mt-6 bg-white shadow rounded overflow-x-auto">
            <table className="min-w-[900px] w-full border-separate border-spacing-y-3">
              <thead className="bg-[#D5F5E3] text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Period End</th>
                  <th className="px-4 py-3 text-left">Points</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      No active members found.
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr
                      key={member._id}
                      className="bg-white shadow-sm hover:shadow-md"
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{member.fullName}</td>
                      <td className="px-4 py-3">{member.email}</td>
                      <td className="px-4 py-3 capitalize">
                        {member.membership.plan || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {member.membership.currentPeriodEnd
                          ? new Date(
                              member.membership.currentPeriodEnd
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {member.membership.points || 0}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => cancelMembership(member._id)}
                          disabled={!member.subscriptionId}
                          className={`px-2 py-1 text-sm rounded text-white ${
                            member.subscriptionId
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipManagement;
