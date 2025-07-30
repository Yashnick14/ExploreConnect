import React from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineLocationMarker,
} from "react-icons/hi";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen fixed top-0 left-0 p-5 bg-gradient-to-b from-black via-[#032915] to-[#032915] text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-emerald-300">Admin</h2>
      <nav className="space-y-4 text-sm">
        <Link
          to="/admin-dashboard"
          className="w-full text-left hover:bg-emerald-700/50 p-2 rounded flex items-center gap-2 transition"
        >
          <HiOutlineHome className="text-emerald-300" /> Dashboard
        </Link>
        <Link
          to="/place-management"
          className="w-full text-left hover:bg-emerald-700/50 p-2 rounded flex items-center gap-2 transition"
        >
          <HiOutlineLocationMarker className="text-emerald-300" /> Places
        </Link>
        <Link
          to="/user-management"
          className="w-full text-left hover:bg-emerald-700/50 p-2 rounded flex items-center gap-2 transition"
        >
          <HiOutlineUserGroup className="text-emerald-300" /> Users
        </Link>
        <button className="w-full text-left hover:bg-emerald-700/50 p-2 rounded flex items-center gap-2 transition">
          <HiOutlineCog className="text-emerald-300" /> Settings
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
