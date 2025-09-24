// src/Components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaRegUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { usePlaceStore } from "@/store/Place/place";
import { useAuthStore } from "@/store/Auth/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/Firebase";
import logo from "../assets/logo.png";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/g, "");

/* ---------------------------- SearchResults ---------------------------- */
const SearchResults = ({
  searchQuery,
  searchResults,
  handleResultClick,
  isMobile,
}) => {
  if (!searchQuery) return null;

  return (
    <div
      className={`mt-2 bg-white shadow-lg rounded-lg z-50 ${
        isMobile ? "" : "absolute top-full left-0 w-full"
      }`}
    >
      {searchResults.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {searchResults.map((place) => (
            <li key={place._id}>
              <Link
                to={`/places/${place._id}`}
                onClick={handleResultClick}
                className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 border">
                  <img
                    src={`${API_BASE}/uploads/${place.images?.[0]}`}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {place.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 px-4 py-2">
          No matching results found
        </p>
      )}
    </div>
  );
};

SearchResults.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  handleResultClick: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

/* -------------------------------- Navbar ------------------------------- */
const Navbar = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const { fetchPlaces, searchPlaces, searchResults, setSearchResults } =
    usePlaceStore();
  const { user, loadUserFromStorage, logout: logoutStore } = useAuthStore();

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    loadUserFromStorage?.();
  }, [loadUserFromStorage]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((o) => !o);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query.trim()) setSearchResults([]);
    else searchPlaces(query);
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setMenuOpen(false);
  };

  // Unified logout (desktop & mobile)
  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileProfileOpen(false);
    setMenuOpen(false);

    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }

    try {
      await fetch(`${API_BASE}/api/users/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }

    logoutStore();
    navigate("/login", { replace: true });
  };

  const displayName =
    user?.username || (user?.email ? user.email.split("@")[0] : null);
  const friendlyName =
    displayName || (user?.email ? user.email.split("@")[0] : "there");

  return (
    <nav className="absolute top-0 left-0 w-full z-[1000] bg-white/60 backdrop-blur-md text-black">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left - Logo */}
        <div className="w-32 h-auto">
          <Link to="/home">
            <img
              src={logo}
              alt="ExploreConnect Logo"
              className="w-full h-auto object-contain"
            />
          </Link>
        </div>

        {/* Center - Nav Links */}
        <div className="nav-headings hidden lg:flex gap-8">
          <Link
            to="/membership"
            className="text-gray-800 font-medium hover:text-gray-700"
          >
            Membership
          </Link>
          <Link
            to="/places"
            className="text-gray-800 font-medium hover:text-gray-700"
          >
            Places
          </Link>
          <Link
            to="/about"
            className="text-gray-800 font-medium hover:text-gray-700"
          >
            About
          </Link>
        </div>

        {/* Right - Search + Login/Profile */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Search */}
          <div className="relative w-[260px]">
            <div className="flex items-center border pl-4 gap-2 border-gray-500/30 h-[46px] rounded-full overflow-hidden w-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 30 30"
                fill="#6B7280"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full h-full outline-none text-gray-500 bg-transparent placeholder-gray-500 text-sm"
              />
            </div>

            <SearchResults
              searchQuery={searchQuery}
              searchResults={searchResults}
              handleResultClick={handleResultClick}
              isMobile={false}
            />
          </div>

          {/* Right side: Login OR Profile */}
          {!user ? (
            <Link
              to="/login"
              className="nav-headings text-gray-800 font-medium hover:text-gray-700"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="nav-headings text-gray-800 font-medium hover:text-gray-700 flex items-center gap-2"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
                title="Profile"
              >
                <FaRegUser className="text-lg" />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-label="Profile menu"
                  className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-[1100]"
                >
                  <div className="px-4 py-3">
                    <div className="text-sm">
                      <span className="text-gray-500 font-normal">Hi </span>
                      <span className="font-semibold text-gray-900">
                        {friendlyName}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Signed in as{" "}
                      <span className="font-medium text-gray-700 break-all">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <hr />
                  <Link
                    to="/favorites"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/registrations"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    My Registrations
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div
          className="lg:hidden flex flex-col gap-1 cursor-pointer ml-auto"
          onClick={toggleMenu}
        >
          <span
            className={`h-[3px] w-6 bg-gray-800 rounded transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-[6px]" : ""
            }`}
          />
          <span
            className={`h-[3px] w-6 bg-gray-800 rounded transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[3px] w-6 bg-gray-800 rounded transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
            }`}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden flex flex-col gap-4 px-6 pb-4">
          <Link
            to="/membership"
            className="text-black font-medium hover:text-emerald-950"
          >
            Membership
          </Link>
          <Link
            to="/places"
            className="text-black font-medium hover:text-emerald-950"
          >
            Places
          </Link>
          <Link
            to="/about"
            className="text-black font-medium hover:text-emerald-950"
          >
            About
          </Link>

          {!user ? (
            <Link
              to="/login"
              className="text-black font-medium hover:text-emerald-950"
            >
              Login
            </Link>
          ) : (
            <>
              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={() => setMobileProfileOpen((o) => !o)}
                  className="flex items-center gap-2 text-black font-medium hover:text-emerald-950 w-full"
                  aria-expanded={mobileProfileOpen}
                  aria-controls="mobile-profile-menu"
                >
                  <FaRegUser /> Profile
                  <span
                    className={`ml-auto text-xs transition-transform ${
                      mobileProfileOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {mobileProfileOpen && (
                  <div
                    id="mobile-profile-menu"
                    className="mt-2 pl-7 flex flex-col gap-2"
                  >
                    <div className="text-sm">
                      <span className="text-gray-500 font-normal">Hi </span>
                      <span className="font-semibold text-gray-900">
                        {friendlyName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Signed in as{" "}
                      <span className="font-medium text-gray-700 break-all">
                        {user.email}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <Link
                      to="/favorites"
                      onClick={() => {
                        setMobileProfileOpen(false);
                        setMenuOpen(false);
                      }}
                      className="text-sm text-gray-800 hover:text-emerald-950"
                    >
                      Favorites
                    </Link>
                    <Link
                      to="/registrations"
                      onClick={() => {
                        setMobileProfileOpen(false);
                        setMenuOpen(false);
                      }}
                      className="text-sm text-gray-800 hover:text-emerald-950"
                    >
                      My Registrations
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => {
                        setMobileProfileOpen(false);
                        setMenuOpen(false);
                      }}
                      className="text-sm text-gray-800 hover:text-emerald-950"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left text-sm text-red-600 hover:text-red-700"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile Search */}
          <div className="flex items-center border pl-4 gap-2 border-gray-500/30 h-[46px] rounded-full overflow-hidden w-full bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 30 30"
              fill="#6B7280"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-full outline-none text-gray-500 bg-transparent placeholder-gray-500 text-sm"
            />
          </div>

          <SearchResults
            searchQuery={searchQuery}
            searchResults={searchResults}
            handleResultClick={handleResultClick}
            isMobile
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
