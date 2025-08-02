import React from "react";
import { HiStar } from "react-icons/hi2";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlinePets } from "react-icons/md";

const PlaceCard = ({ place }) => {

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 hover:-translate-y-1">
      
      {/* Pets Badge */}
      {place.petsAllowed && (
        <div className="absolute top-3 right-3 z-10">
          <div className="group inline-flex items-center bg-emerald-100 text-emerald-700 font-medium rounded-full px-2 w-9 h-9 transition-all duration-500 ease-in-out overflow-hidden hover:w-32 hover:px-3 cursor-pointer">
            <MdOutlinePets className="text-lg min-w-[1rem]" />
            <span className="ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
              Pets Allowed
            </span>
          </div>
        </div>
      )}

      {/* Image */}
      <img
        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${place.images?.[0]}`}
        alt={place.name}
        className="w-full h-56 object-cover transition duration-300"
      />




      {/* Content */}
      <div className="p-5 text-center">
        {/* Title */}
        <h3 className="text-gray-900 text-lg font-semibold mb-2 leading-tight">
          {place.name}
        </h3>

        {/* Location */}
        <p className="flex justify-center items-center text-gray-600 text-sm gap-1 mb-1">
          <HiOutlineLocationMarker className="text-red-600 text-base" />
          <span className="font-medium">{place.district}</span>
        </p>

        {/* Working Hours */}
        <p className="text-xs text-gray-500 font-medium tracking-wide mb-2">
          Open: {place.workingHours}
        </p>

        {/* Rating */}
        <p className="text-sm font-medium flex justify-center items-center gap-1 text-emerald-500">
          <HiStar className="text-yellow-400" />
          <span>4.6 (120 reviews)</span>
        </p>
      </div>
    </div>
  );
};

export default PlaceCard;
