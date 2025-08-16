// src/Components/Sidebar.jsx
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlineCog,
} from "react-icons/hi";
import { RiFileList3Line } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";
import logo from "../assets/logoadmin.png";

import { useAuthStore } from "@/store/Auth/auth";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminDashboard = location.pathname === "/admin-dashboard";

  const logoutStore = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await signOut(auth); // firebase client sign-out
    } catch (e) {
      console.warn("firebase signOut failed (ignored):", e?.message);
    }

    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/auth/firebase/logout`,
        { method: "POST", credentials: "include" }
      );
    } catch (e) {
      console.warn("server logout failed (ignored):", e?.message);
    }

    logoutStore();                // clear zustand + localStorage
    navigate("/login", { replace: true });
  };

  const baseLinkClasses =
    "w-full text-left p-2 rounded flex items-center gap-2 transition-colors duration-200";
  const activeLinkClasses = "bg-emerald-700/50";

  return (
    <aside className="w-48 sm:w-56 md:w-64 h-screen fixed top-0 left-0 p-3 sm:p-4 md:p-5 bg-gradient-to-b from-black via-[#032915] to-[#032915] text-white shadow-lg z-50">
      <div className={`${isAdminDashboard ? "pt-6 sm:pt-4 md:pt-0" : "pt-12 md:pt-0"}`}>
        <img
          src={logo}
          alt="ExploreConnect Logo"
          className="w-32 sm:w-36 md:w-40 mb-4 sm:mb-6 md:mb-8 object-contain"
        />

        <nav className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm">
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `${baseLinkClasses} ${isActive ? activeLinkClasses : "hover:bg-emerald-700/50"}`
            }
          >
            <HiOutlineHome className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Dashboard</span>
          </NavLink>

          <NavLink
            to="/place-management"
            className={({ isActive }) =>
              `${baseLinkClasses} ${isActive ? activeLinkClasses : "hover:bg-emerald-700/50"}`
            }
          >
            <HiOutlineLocationMarker className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Places</span>
          </NavLink>

          <NavLink
            to="/user-management"
            className={({ isActive }) =>
              `${baseLinkClasses} ${isActive ? activeLinkClasses : "hover:bg-emerald-700/50"}`
            }
          >
            <HiOutlineUserGroup className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Users</span>
          </NavLink>

          <NavLink
            to="/registration-management"
            className={({ isActive }) =>
              `${baseLinkClasses} ${isActive ? activeLinkClasses : "hover:bg-emerald-700/50"}`
            }
          >
            <RiFileList3Line className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Registrations</span>
          </NavLink>

          <button
            type="button"
            className="w-full text-left hover:bg-emerald-700/50 p-2 rounded flex items-center gap-2 transition-colors duration-200"
          >
            <HiOutlineCog className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Settings</span>
          </button>
        </nav>
      </div>

      {/* Logout icon pinned to bottom-left of the sidebar */}
      <button
        type="button"
        onClick={handleLogout}
        title="Log out"
        aria-label="Log out"
        className="absolute bottom-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20
                   border border-white/10 backdrop-blur-sm transition flex items-center justify-center"
      >
        <FiLogOut className="text-white text-xl" />
      </button>
    </aside>
  );
};

export default Sidebar;
