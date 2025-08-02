import React, { useEffect, useState } from "react";
import { usePlaceStore } from "../../store/Place/place";
import PlaceCard from "../../Components/PlaceCard";
import { FiFilter } from "react-icons/fi";
import { BsArrowLeftCircle } from "react-icons/bs";

const Places = () => {
  const { places, fetchPlaces } = usePlaceStore();
  const [filtered, setFiltered] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [places, selectedCategory, selectedDistrict]);

  const filterPlaces = () => {
    let result = [...places];
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (selectedDistrict !== "All") {
      result = result.filter((p) => p.district === selectedDistrict);
    }
    setFiltered(result);
  };

  const uniqueCategories = [...new Set(places.map((p) => p.category))];
  const uniqueDistricts = [...new Set(places.map((p) => p.district))];

  return (
    <div className="relative bg-gray-100 min-h-screen p-3 sm:p-4 md:p-5 pt-16 sm:pt-20 md:pt-24">
      {/* Header with Filter Icon */}
      <div className="flex justify-center items-center relative mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center px-8">
          Explore Places
        </h1>

        {/* Filter Button */}
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute right-0 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <FiFilter size={18} className="sm:hidden" />
          <FiFilter size={20} className="hidden sm:block md:hidden" />
          <FiFilter size={22} className="hidden md:block" />
        </button>
      </div>

      {/* No Matching Places Message */}
      {filtered.length === 0 && (
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center px-4">
            No matching places found
          </h2>
        </div>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-white z-50 shadow-lg transition-transform duration-300 ease-in-out
          w-80 sm:w-72 md:w-64 lg:w-80
          ${showSidebar ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Slide-Out Arrow Button - Only show on larger screens */}
        {showSidebar && (
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute -left-[23px] top-1/2 transform -translate-y-1/2 bg-white p-1 rounded-l-full transition z-50 hidden md:block"
            style={{
              boxShadow: "-5px 0 10px rgba(0,0,0,0.1)",
            }}
            title="Hide Filters"
          >
            <BsArrowLeftCircle size={28} className="text-gray-500" />
          </button>
        )}

        {/* Filter Sidebar Content */}
        <div className="p-4 sm:p-4 md:p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg font-bold">Filter Places</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-black transition-colors"
              title="Close Filter"
            >
              <BsArrowLeftCircle size={22} className="sm:hidden" />
              <BsArrowLeftCircle size={24} className="hidden sm:block" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-4 md:mb-5">
            <label className="block mb-2 text-xs sm:text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="mb-4 md:mb-5">
            <label className="block mb-2 text-xs sm:text-sm font-medium text-gray-700">
              District
            </label>
            <select
              className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="All">All Districts</option>
              {uniqueDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          <button
            className="mt-4 px-4 py-2.5 sm:py-3 w-full text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
            onClick={() => {
              setSelectedCategory("All");
              setSelectedDistrict("All");
            }}
          >
            Reset Filters
          </button>

          {/* Results count for mobile */}
          <div className="mt-4 p-2.5 sm:p-3 bg-gray-50 rounded-lg sm:hidden">
            <p className="text-xs text-gray-600 text-center">
              {filtered.length} place{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Places Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 justify-items-center max-w-7xl mx-auto">
          {filtered.map((place) => (
            <div key={place._id} className="w-full max-w-xs sm:max-w-sm">
              <PlaceCard place={place} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Places;