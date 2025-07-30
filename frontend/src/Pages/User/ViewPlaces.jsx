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
    <div className="relative bg-sky-50 min-h-screen p-5 pt-24">
      {/* Header with Filter Icon */}
      <div className="flex justify-center items-center relative mb-8">
        <h1 className="text-3xl font-bold text-center">
          {filtered.length === 0 ? "No matching places found" : "Explore Places"}
        </h1>

        {/* Filter Button */}
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute right-0 bg-white p-2 rounded-full shadow-md hover:shadow-lg"
        >
          <FiFilter size={22} />
        </button>
      </div>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-lg transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Slide-Out Arrow Button */}
        {showSidebar && (
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute -left-[23px] top-1/2 transform -translate-y-1/2 bg-white p-1 rounded-l-full transition z-50"
            style={{
              boxShadow: "-5px 0 10px rgba(0,0,0,0.1)",
            }}
            title="Hide Filters"
          >
            <BsArrowLeftCircle size={28} className="text-gray-500" />
          </button>
        )}

        {/* Filter Sidebar Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Filter Places</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-black"
              title="Close Filter"
            >
              <BsArrowLeftCircle size={24} />
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">Category</label>
            <select
              className="w-full p-2 border rounded"
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
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">District</label>
            <select
              className="w-full p-2 border rounded"
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
            className="mt-4 px-4 py-2 w-full bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
            onClick={() => {
              setSelectedCategory("All");
              setSelectedDistrict("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Places Grid */}
      <div className="flex flex-wrap justify-center gap-6">
        {filtered.map((place) => (
          <div key={place._id} className="w-full sm:w-[45%] md:w-[22%]">
            <PlaceCard place={place} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Places;
