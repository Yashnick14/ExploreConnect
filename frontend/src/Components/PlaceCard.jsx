import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlinePets } from "react-icons/md";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const PlaceCard = ({ place }) => {
  const avg = place.avgRating || 0;
  const total = place.totalReviews || 0;

  // Build star array (0–5) based on avgRating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (avg >= i) {
        stars.push(<AiFillStar key={i} className="text-yellow-400 w-5 h-5" />);
      } else if (avg >= i - 0.5) {
        stars.push(
          <span key={i} className="relative w-5 h-5">
            <AiOutlineStar className="text-yellow-400 w-5 h-5 absolute" />
            <AiFillStar
              className="text-yellow-400 w-5 h-5 absolute"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </span>
        );
      } else {
        stars.push(<AiOutlineStar key={i} className="text-gray-300 w-5 h-5" />);
      }
    }
    return stars;
  };

  return (
    <Link
      to={`/places/${place._id}`}
      className="block relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 hover:-translate-y-1"
    >
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
        <h3 className="text-gray-900 text-lg font-semibold mb-2 leading-tight">
          {place.name}
        </h3>

        <p className="flex justify-center items-center text-gray-600 text-sm gap-1 mb-1">
          <HiOutlineLocationMarker className="text-red-600 text-base" />
          <span className="font-medium">{place.district}</span>
        </p>

        <p className="text-xs text-gray-500 font-medium tracking-wide mb-2">
          Open: {place.workingHours}
        </p>

        {/* ⭐ Dynamic Stars + Rating */}
        {total > 0 ? (
          <div className="flex justify-center items-center gap-1">
            {renderStars()}
            <span className="ml-2 text-sm font-medium text-emerald-700">
              {avg.toFixed(1)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-emerald-700">No reviews yet</p>
        )}
      </div>
    </Link>
  );
};

PlaceCard.propTypes = {
  place: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    district: PropTypes.string.isRequired,
    workingHours: PropTypes.string,
    petsAllowed: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.string),
    avgRating: PropTypes.number,
    totalReviews: PropTypes.number,
  }).isRequired,
};

export default PlaceCard;
