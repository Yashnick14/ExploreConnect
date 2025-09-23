// src/Pages/User/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { FiCamera, FiEdit3, FiHeart, FiCalendar } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/Auth/auth";
import { useUserStore } from "@/store/User/user";
import { useThemeStore } from "@/store/User/Theme";
import { useRegistrationStore } from "@/store/User/Registration";
import { FaCrown } from "react-icons/fa"; // 👑 Crown icon
import Registrations from "./Registrations";
import Favorites from "./Favorites";
import MembershipModal from "@/Components/MembershipModal";

const Dashboard = () => {
  const { user, setUser, loadUserFromStorage, fetchUserFromDB } =
    useAuthStore();
  const { updateUserProfile } = useUserStore();
  const { setTheme, theme } = useThemeStore();
  const { fetchRegistrations } = useRegistrationStore();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [file, setFile] = useState(null);
  const [predefinedAvatar, setPredefinedAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState("registrations");
  const [membershipOpen, setMembershipOpen] = useState(false);

  const fileInputRef = useRef(null);

  // ✅ Predefined avatars (from public/avatars folder)
  const predefinedAvatars = [
    "/avatars/horse.png",
    "/avatars/jaguar.png",
    "/avatars/panda.png",
    "/avatars/cat.png",
  ];

  useEffect(() => {
    loadUserFromStorage?.();
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (user?.uid) {
      fetchUserFromDB(user.uid);
      fetchRegistrations({ email: user.email });
    }
  }, [user?.uid, fetchUserFromDB, fetchRegistrations]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  // ✅ membership data
  const isMember = !!user?.membership?.isMember;
  const expiryDate = user?.membership?.currentPeriodEnd
    ? new Date(user.membership.currentPeriodEnd).toLocaleDateString()
    : null;
  const points = user?.membership?.points ?? 0;

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPredefinedAvatar(null); // clear predefined selection
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleChoosePredefined = (url) => {
    setAvatarPreview(url);
    setPredefinedAvatar(url);
    setFile(null); // clear uploaded file
  };

  const handleSave = async () => {
    if (!user?._id) return toast.error("Missing user id");
    // Accepts +94XXXXXXXXX (Sri Lanka format) or 10 digits
    if (!/^(\+94\d{9}|\d{10})$/.test(phoneNumber)) {
      return toast.error(
        "Phone number must be 10 digits or start with +94 followed by 9 digits"
      );
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("fullName", fullName.trim());
    formData.append("phoneNumber", phoneNumber.trim());

    if (file) {
      formData.append("avatar", file); // upload file
    } else if (predefinedAvatar) {
      formData.append("predefinedAvatar", predefinedAvatar); // send chosen avatar
    }

    try {
      const res = await updateUserProfile(user._id, formData);
      if (res.success) {
        toast.success("Profile updated successfully!");
        setUser(res.data);
        setEditMode(false);
        setPredefinedAvatar(null);
        setFile(null);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Error updating profile");
    }
  };

  return (
    <div className={`theme-${theme} min-h-screen pt-[100px]`}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ===== Left Profile Sidebar ===== */}
        <aside className="relative rounded-2xl shadow-lg p-6 flex flex-col items-center space-y-3 self-start border bg-white backdrop-blur-sm border-gray-200">
          {/* ✅ Membership Badge */}
          {isMember && (
            <button
              onClick={() => setMembershipOpen(true)}
              className="absolute top-3 right-3 bg-green-600 text-yellow-300 rounded-full px-3 h-8 flex items-center justify-center shadow-md hover:bg-green-700"
              title="View Membership"
            >
              <FaCrown className="w-4 h-4" />
              <span className="ml-1 text-xs font-medium text-white">
                Member
              </span>
            </button>
          )}

          {/* Avatar */}
          <div className="relative mt-6 flex flex-col items-center">
            <div className="relative">
              <img
                src={
                  avatarPreview || "https://placehold.co/120x120?text=Profile"
                }
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

            {/* Predefined Avatars */}
            {editMode && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {predefinedAvatars.map((url) => (
                  <button
                    key={url}
                    onClick={() => handleChoosePredefined(url)}
                    className={`w-12 h-12 rounded-full border-2 overflow-hidden hover:scale-110 transition ${
                      avatarPreview === url
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={url}
                      alt="avatar option"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Username + Email */}
          <h2 className="text-lg font-semibold text-gray-900 mt-3">
            {user?.username}
          </h2>
          <p className="text-sm text-gray-500">{user?.email}</p>

          {/* Profile Info */}
          {!editMode ? (
            <div className="flex flex-col items-center gap-2 mt-3">
              <button
                onClick={() => setEditMode(true)}
                className="border text-sm text-gray-500 border-gray-400/30 w-28 h-8 rounded-full flex items-center justify-center gap-1 hover:bg-gray-100"
              >
                <FiEdit3 className="w-4 h-4" /> Edit
              </button>
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
                  className="flex-1 px-3 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 bg-white text-black rounded-lg text-sm hover:bg-gray-100"
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
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {i === 0 ? "Default" : `Theme ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="lg:col-span-3 rounded-2xl shadow-lg p-6 bg-white/40 backdrop-blur-sm text-gray-900">
          <div className="flex gap-6 border-b mb-3 border-gray-200 bg-transparent">
            <button
              className={`pb-1 font-medium flex items-center gap-2 ${
                activeTab === "registrations"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("registrations")}
            >
              <FiCalendar /> My Registrations
            </button>
            <button
              className={`pb-1 font-medium flex items-center gap-2 ${
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
            {activeTab === "registrations" && <Registrations embedded />}
            {activeTab === "favorites" && <Favorites embedded />}
          </div>
        </main>
      </div>

      {/* Membership Modal */}
      <MembershipModal
        isOpen={membershipOpen}
        onClose={() => setMembershipOpen(false)}
        user={user}
        expiryDate={expiryDate}
        points={points}
        fetchUserFromDB={fetchUserFromDB}
        fetchRegistrations={fetchRegistrations}
      />
    </div>
  );
};

export default Dashboard;
