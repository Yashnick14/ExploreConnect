import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlaceStore } from "@/store/Place/place";
import { toast } from "react-hot-toast";
import {
  FiHeart,
  FiUser,
  FiMapPin,
  FiMap,
  FiTag,
  FiPhone,
  FiClock,
} from "react-icons/fi";
import { MdPets } from "react-icons/md";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const reviewsData = [
  {
    img: "https://readymadeui.com/team-2.webp",
    name: "Emily Carter",
    title: "Quick and Easy Experience",
    time: "2 days ago",
    text:
      "Everything was seamless. Ordering was simple and the response time was super fast. Highly recommend to anyone looking for convenience and speed.",
  },
  {
    img: "https://readymadeui.com/team-3.webp",
    name: "Daniel Kim",
    title: "Fantastic Support",
    time: "3 days ago",
    text:
      "Had a few questions before ordering and the customer service team was amazing—super responsive and knowledgeable. It really made a difference!",
  },
];

const PlacePreview = () => {
  const { id } = useParams();
  const { getPlaceById } = usePlaceStore();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoursOpen, setHoursOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getPlaceById(id);
      if (res.success) setPlace(res.data);
      else toast.error(res.message || "Place not found");
      setLoading(false);
    })();
  }, [id, getPlaceById]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!place) return <div className="p-10 text-center">Place not found</div>;

  const details = [
    { icon: <FiMapPin />, label: "Location", value: place.location },
    { icon: <FiMap />, label: "District", value: place.district },
    { icon: <FiTag />, label: "Category", value: place.category },
    { icon: <FiPhone />, label: "Contact", value: place.contactNumber },
    { icon: <FiClock />, label: "Hours", value: place.workingHours },
    {
      icon: <MdPets />,
      label: "Pets Allowed",
      value: place.petsAllowed ? "Yes" : "No",
    },
  ];

  // parse coords
  const lat = parseFloat(place.lat);
  const lng = parseFloat(place.lng);
  const hasCoords = !isNaN(lat) && !isNaN(lng);

  return (
    <div className="pt-[100px]">
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{place.name}</h1>
          <div className="flex items-center space-x-4 text-sm">
            <button className="flex items-center gap-1 hover:underline">
              <span className="text-lg">✏️</span> Review
            </button>
            <button className="flex items-center gap-1 border rounded-full px-3 py-1 hover:bg-gray-100">
              <FiHeart className="text-lg" />
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="mb-8">
          {place.images[0] && (
            <img
              src={`http://localhost:5000/uploads/${place.images[0]}`}
              alt="Main"
              className="w-full h-[450px] object-cover rounded-xl mb-4"
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {place.images.slice(1).map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000/uploads/${img}`}
                alt={`Gallery ${i + 1}`}
                className="w-full h-[200px] object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-700">{place.description}</p>
            </section>

            {/* Inline Details */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {details.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-2xl text-blue-600">{d.icon}</div>
                    <div>
                      <p className="text-sm text-gray-500">{d.label}</p>
                      <p className="font-medium text-gray-800">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Map */}
            {hasCoords && (
              <section>
                <h2 className="text-xl font-semibold mb-2">Location on Map</h2>
                <MapContainer
                  center={[lat, lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>{place.name}</Popup>
                  </Marker>
                </MapContainer>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-semibold mb-4">All reviews</h2>
              <div className="divide-y divide-gray-300">
                {reviewsData.map((r, idx) => (
                  <div key={idx} className="py-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={r.img}
                        alt={r.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-400"
                      />
                      <div>
                        <p className="text-[15px] font-semibold text-gray-900">
                          {r.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-600/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-2 h-2 fill-green-700"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9.225 20.656a1.206 1.206...z" />
                            </svg>
                          </span>
                          <p className="text-xs text-gray-600">
                            Verified Buyer
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h6 className="font-semibold text-gray-900">
                        {r.title}
                      </h6>
                      <div className="flex items-center mt-2 text-yellow-400 space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-[18px] h-[18px] fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.42L6.25 21.54...z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {r.time}
                        </span>
                      </div>
                      <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
                        {r.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-4">
            {/* Hours Box */}
            <div className="w-64">
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setHoursOpen((o) => !o)}
                  className="w-full flex justify-between items-center px-3 py-2 bg-white hover:bg-gray-50 text-sm"
                >
                  <span className="font-medium text-gray-800">Hours</span>
                  <span
                    className="transform transition-transform"
                    style={{
                      transform: hoursOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  >
                    ▼
                  </span>
                </button>
                {hoursOpen && (
                  <div className="px-3 pb-3 pt-1 bg-white text-sm">
                    <p className="mb-1 font-medium text-red-600">
                      Closed now
                    </p>
                    <p className="text-gray-600">Friday</p>
                    <p className="text-gray-800">{place.workingHours}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Register Button */}
            <div className="w-48">
              <button className="w-full py-2 text-sm text-white bg-black rounded-lg hover:bg-gray-900 transition">
                Register
              </button>
            </div>

            {/* Live Count */}
            <div className="w-40">
              <div className="flex items-center justify-between p-2 text-sm border rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiUser className="text-xl text-gray-700" />
                  <span className="w-2 h-2 bg-green-500 rounded-full block" />
                  <span className="font-medium">Live count</span>
                </div>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacePreview;
