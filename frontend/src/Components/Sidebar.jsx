import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlineCog,
} from "react-icons/hi";
import logo from "../assets/logoadmin.png"; // Adjust the path as necessary


const Sidebar = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname === "/admin-dashboard";

  const baseLinkClasses =
    "w-full text-left p-2 rounded flex items-center gap-2 transition-colors duration-200";
  const activeLinkClasses = "bg-emerald-700/50";

  return (
    <aside className="w-48 sm:w-56 md:w-64 h-screen fixed top-0 left-0 p-3 sm:p-4 md:p-5 bg-gradient-to-b from-black via-[#032915] to-[#032915] text-white shadow-lg z-50">
      <div
        className={`${
          isAdminDashboard
            ? "pt-6 sm:pt-4 md:pt-0" // Less padding on admin-dashboard
            : "pt-12 md:pt-0" // Default padding
        }`}
      >
        <img
          src={logo}
          alt="ExploreConnect Logo"
          className="w-32 sm:w-36 md:w-40 mb-4 sm:mb-6 md:mb-8 object-contain"
        />

        <nav className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm">
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `${baseLinkClasses} ${
                isActive ? activeLinkClasses : "hover:bg-emerald-700/50"
              }`
            }
          >
            <HiOutlineHome className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Dashboard</span>
          </NavLink>

          <NavLink
            to="/place-management"
            className={({ isActive }) =>
              `${baseLinkClasses} ${
                isActive ? activeLinkClasses : "hover:bg-emerald-700/50"
              }`
            }
          >
            <HiOutlineLocationMarker className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Places</span>
          </NavLink>

          <NavLink
            to="/user-management"
            className={({ isActive }) =>
              `${baseLinkClasses} ${
                isActive ? activeLinkClasses : "hover:bg-emerald-700/50"
              }`
            }
          >
            <HiOutlineUserGroup className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Users</span>
          </NavLink>

          {/* Settings Button */}
          <button className="w-full text-left hover:bg-emerald-700/50 p-2 rounded flex items-center gap-2 transition-colors duration-200">
            <HiOutlineCog className="text-emerald-300 text-lg sm:text-base flex-shrink-0" />
            <span className="truncate">Settings</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
