import React, { useState, useEffect } from "react";
import { FaRegUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { usePlaceStore } from "@/store/Place/place";

const SearchResults = ({ searchQuery, searchResults, handleResultClick, isMobile }) => {
  if (!searchQuery) return null;

  return (
    <div className={`mt-2 bg-white shadow-lg rounded-lg z-50 ${isMobile ? "" : "absolute top-full left-0 w-full"}`}>
      {searchResults.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {searchResults.map((place) => (
            <li key={place._id}>
              <Link
                to={`/places/${place._id}`}
                className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100"
                onClick={handleResultClick}
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 border">
                  <img
                    src={`http://localhost:5000/uploads/${place.images?.[0]}`}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">{place.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 px-4 py-2">No matching results found</p>
      )}
    </div>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    fetchPlaces,
    searchPlaces,
    searchResults,
    setSearchResults,
  } = usePlaceStore();

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
    } else {
      searchPlaces(query);
    }
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setMenuOpen(false);
  };

  return (
    <nav className="absolute top-0 left-0 w-full z-[1000] bg-white/60 backdrop-blur-md text-black">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left - Logo */}
        <div className=" text-xl font-bold text-gray-900">
          <Link to="/">EXPLORECONNECT</Link>
        </div>

        {/* Center - Nav Links */}
        <div className="nav-headings hidden lg:flex gap-8">
          <Link to="/membership" className="text-gray-800 font-medium hover:text-emerald-900">
            Membership
          </Link>
          <Link to="/places" className="text-gray-800 font-medium hover:text-emerald-900">
            Places
          </Link>
          <Link to="/about" className="text-gray-800 font-medium hover:text-emerald-900">
            About
          </Link>
        </div>

        {/* Right - Search + Login/Profile */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Search Container */}
          <div className="relative w-[260px]">
            <div className="flex items-center border pl-4 gap-2 border-gray-500/30 h-[46px] rounded-full overflow-hidden w-full bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 30 30" fill="#6B7280">
                <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"/>
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
          <div>
            
          </div>
          <Link to="/login" className="nav-headings text-gray-800 font-medium hover:text-emerald-900">Login</Link>
          <Link to="/profile" className="nav-headings text-gray-800 font-medium hover:text-emerald-900">
            <FaRegUser />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex flex-col gap-1 cursor-pointer ml-auto" onClick={toggleMenu}>
          <span className={`h-[3px] w-6 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
          <span className={`h-[3px] w-6 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`h-[3px] w-6 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden flex flex-col gap-4 px-6 pb-4">
          <Link to="/membership" className="text-black font-medium hover:text-emerald-950">Membership</Link>
          <Link to="/places" className="text-black font-medium hover:text-emerald-950">Places</Link>
          <Link to="/about" className="text-black font-medium hover:text-emerald-950">About</Link>
          <Link to="/login" className="text-black font-medium hover:text-emerald-950">Login</Link>
          <Link to="/profile" className="text-black font-medium hover:text-emerald-950"><FaRegUser /></Link>

          <div className="flex items-center border pl-4 gap-2 border-gray-500/30 h-[46px] rounded-full overflow-hidden w-full bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 30 30" fill="#6B7280">
              <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"/>
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
            isMobile={true}
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
