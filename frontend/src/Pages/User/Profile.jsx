// src/Pages/User/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
<<<<<<< HEAD
import { FiCamera, FiEdit3, FiHeart, FiCalendar } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/Auth/auth";
import { useUserStore } from "@/store/User/user";
import { useThemeStore } from "@/store/User/Theme";

import Registrations from "./Registrations";
import Favorites from "./Favorites";

const Dashboard = () => {
  const { user, setUser, loadUserFromStorage } = useAuthStore();
  const { updateUserProfile } = useUserStore();
  const { setTheme, theme } = useThemeStore();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [file, setFile] = useState(null);

  const [activeTab, setActiveTab] = useState("registrations");
  const fileInputRef = useRef(null);

  // Load user
  useEffect(() => {
    loadUserFromStorage?.();
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setAvatarPreview(user.avatar || "");
=======
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
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
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
<<<<<<< HEAD
    if (!/^\d{10}$/.test(phoneNumber)) {
      return toast.error("Phone number must be exactly 10 digits");
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("fullName", fullName.trim());
    formData.append("phoneNumber", phoneNumber.trim());
=======

    const formData = new FormData();
    formData.append("username", username.trim());
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
    if (file) formData.append("avatar", file);

    try {
      const res = await updateUserProfile(user._id, formData);
      if (res.success) {
        toast.success("Profile updated successfully!");
<<<<<<< HEAD
        setUser(res.data);
        setEditMode(false);
=======

        if (res.data?.avatar) {
          setAvatarPreview(`${API_BASE}/${res.data.avatar}`);
        }

        if (setUser) {
          setUser(res.data); // ✅ update sessionStorage
        }
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Error updating profile");
    }
  };

  return (
<<<<<<< HEAD
    <div className={`theme-${theme} min-h-screen pt-[100px]`}>
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ===== Left Profile Sidebar (ALWAYS fixed white style) ===== */}
        <aside className="rounded-2xl shadow-lg p-6 flex flex-col items-center space-y-3 self-start border bg-white backdrop-blur-sm border-gray-200">
          {/* Avatar */}
          <div className="relative">
            <img
              src={avatarPreview || "https://placehold.co/120x120?text=Profile"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
            />
            {editMode && (
              <>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition"
                >
                  <FiCamera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>

          {/* Profile Info */}
          {!editMode ? (
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.username}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>

              <div className="flex justify-center">
                <button
                  onClick={() => setEditMode(true)}
                  className="border text-sm text-gray-500 border-gray-400/30 w-28 h-8 rounded-full mt-3 flex items-center justify-center gap-1 hover:bg-gray-100"
                >
                  <FiEdit3 className="w-4 h-4" /> Edit
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div>
                <label className="text-xs">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-sm"
                />
              </div>
              <div>
                <label className="text-xs">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Theme Selector */}
          <div className="mt-6 w-full text-center">
            <label className="block text-sm mb-2 font-medium text-gray-900">
              Choose Background
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {["theme1", "theme2", "theme3", "theme4"].map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    theme === t
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {i === 0 ? "Default" : `Theme ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ===== Main Content (transparent so background shows through) ===== */}
        <main className="lg:col-span-3 rounded-2xl shadow-lg p-6 bg-white/40 backdrop-blur-sm text-gray-900">
          {/* Top area now also transparent */}
          <div className="flex gap-6 border-b mb-6 border-gray-200 bg-transparent">
            <button
              className={`pb-2 font-medium flex items-center gap-2 ${
                activeTab === "registrations"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("registrations")}
            >
              <FiCalendar /> My Registrations
            </button>
            <button
              className={`pb-2 font-medium flex items-center gap-2 ${
                activeTab === "favorites"
                  ? "border-b-2 border-rose-500 text-rose-500"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              <FiHeart /> My Favorites
            </button>
          </div>

          <div>
            {activeTab === "registrations" && <Registrations />}
            {activeTab === "favorites" && <Favorites />}
          </div>
        </main>
=======
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
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
      </div>
    </div>
  );
};

export default Dashboard;
