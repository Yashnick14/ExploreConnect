// src/Pages/User/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { FiCamera, FiUser, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/Auth/auth";
import { useUserStore } from "@/store/User/user";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Dashboard = () => {
  const { user, setUser } = useAuthStore();
  const { updateUserProfile } = useUserStore();

  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [file, setFile] = useState(null);

  const fileInputRef = useRef(null);

  // ✅ Initialize fields from store user
  useEffect(() => {
    if (user) {
      setUsername(user.username || user.fullName || "");
      setAvatarPreview(user.avatar ? `${API_BASE}/${user.avatar}` : "");
    }
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleSave = async () => {
    if (!user?._id) return toast.error("Missing user id");

    const formData = new FormData();
    formData.append("username", username.trim());
    if (file) formData.append("avatar", file);

    try {
      const res = await updateUserProfile(user._id, formData);
      if (res.success) {
        toast.success("Profile updated successfully!");

        if (res.data?.avatar) {
          setAvatarPreview(`${API_BASE}/${res.data.avatar}`);
        }

        if (setUser) {
          setUser(res.data); // ✅ update sessionStorage
        }
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Error updating profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-[100px]">
      <div className="max-w-3xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-lg space-y-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={
                avatarPreview ||
                "https://placehold.co/150x150?text=Profile+Photo"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
            />
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black transition"
            >
              <FiCamera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="mt-3 text-gray-500 text-sm">
            Click the camera icon to change your photo
          </p>
        </div>

        {/* User Info */}
        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FiUser /> Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FiMail /> Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
