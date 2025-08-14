// src/Pages/User/PlacePreview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import { BsPatchCheckFill } from "react-icons/bs";
import { AiFillStar } from "react-icons/ai";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { getAuth, onAuthStateChanged } from "firebase/auth"; // 🔒 check anonymous
import { useAuthStore } from "@/store/Auth/auth";             // your auth store (path matches what you shared)
import { usePlaceStore } from "@/store/Place/place";
import { useRegistrationStore } from "@/store/User/Registration";
import RegisterModal from "@/Components/RegisterModal";

// fix default marker icon paths for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// --- helpers for weekly hours ---
const ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LABEL = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};
const to12h = (hhmm) => {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return "";
  let [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
};
const pickRow = (weekly, code) => {
  if (!Array.isArray(weekly)) return null;
  return (
    weekly.find(
      (d) => d.day === code || d.key === code || d.label === LABEL[code]
    ) || null
  );
};
const isOpenNow = (weekly) => {
  if (!Array.isArray(weekly)) return false;
  const now = new Date();
  const jsDay = now.getDay(); // 0 Sun .. 6 Sat
  const code = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][jsDay];
  const row = pickRow(weekly, code);
  if (!row || !row.isOpen) return false;
  const [oh, om] = row.open.split(":").map(Number);
  const [ch, cm] = row.close.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  return nowMin >= openMin && nowMin <= closeMin;
};

// ---- extra helpers for nicer UI ----
const DAYCODES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayCode = () => DAYCODES[new Date().getDay()];
const nextOpenInfo = (weekly) => {
  if (!Array.isArray(weekly)) return "";
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = todayCode();
  for (let i = 0; i < 7; i++) {
    const idx = (DAYCODES.indexOf(today) + i) % 7;
    const code = DAYCODES[idx];
    const row = pickRow(weekly, code);
    if (!row || !row.isOpen) continue;
    const [oh, om] = row.open.split(":").map(Number);
    const [ch, cm] = row.close.split(":").map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    if (i === 0) {
      if (nowMin >= openMin && nowMin <= closeMin)
        return `Closes at ${to12h(row.close)}`;
      if (nowMin < openMin) return `Opens today at ${to12h(row.open)}`;
    } else {
      return `Opens ${LABEL[code]} at ${to12h(row.open)}`;
    }
  }
  return "";
};

// --- time parsing for registration validation ---
const mmFromHHMM24 = (hhmm) => {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const parseUserTimeToMinutes = (t) => {
  if (!t) return null;
  const s = t.toLowerCase().replace(/\s/g, "");
  const first = s.split(/-|–|—/)[0];
  if (/^\d{1,2}:\d{2}$/.test(first)) {
    const [h, m] = first.split(":").map(Number);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) return h * 60 + m;
  }
  const m12 = first.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
  if (m12) {
    let h = Number(m12[1]);
    const m = Number(m12[2] || 0);
    const suf = m12[3];
    if (h === 12) h = 0;
    let total = h * 60 + m;
    if (suf === "pm") total += 12 * 60;
    return total;
  }
  return null;
};
const parseDailyRangeFromString = (hoursStr) => {
  if (!hoursStr) return null;
  const s = hoursStr.toLowerCase().replace(/\s/g, "");
  const parts = s.split(/-|–|—/);
  if (parts.length !== 2) return null;
  const start = parseUserTimeToMinutes(parts[0]);
  const end = parseUserTimeToMinutes(parts[1]);
  if (start == null || end == null) return null;
  return [start, end];
};

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
  const { createRegistration } = useRegistrationStore();

  // 🔐 your app user from store (set after backend login)
  const { user, loadUserFromStorage } = useAuthStore();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoursOpen, setHoursOpen] = useState(false);

  // modal
  const [showRegister, setShowRegister] = useState(false);

  // firebase auth state (to detect anonymous)
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // ensure store reloads persisted user on refresh
    loadUserFromStorage?.();

    // listen to Firebase Auth
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setIsAnonymous(!!fbUser?.isAnonymous);
    });
    return () => unsub();
  }, [loadUserFromStorage]);

  useEffect(() => {
    (async () => {
      const res = await getPlaceById(id);
      if (res.success) setPlace(res.data);
      else toast.error(res.message || "Place not found");
      setLoading(false);
    })();
  }, [id, getPlaceById]);

  // normalize weekly (could be JSON string or array)
  const weekly = useMemo(() => {
    let w = place?.workingHoursWeekly;
    try {
      if (typeof w === "string") w = JSON.parse(w);
    } catch {}
    return w;
  }, [place]);

  const openNow = useMemo(() => isOpenNow(weekly), [weekly]);

  // click handler for the Register button — block guests & anonymous
  const handleOpenRegister = () => {
    // Must have an app user (from your backend) AND not be anonymous
    if (!user) {
      toast.error("Please register / sign in first.");
      return;
    }
    if (isAnonymous) {
      toast.error("You’re currently signed in as a guest. Please register first.");
      return;
    }
    if (user.status && user.status !== "active") {
      toast.error("Your account is not active.");
      return;
    }
    setShowRegister(true);
  };

  // === Submit registration -> validate against hours -> store -> backend
  const handleRegisterSubmit = async (payload) => {
    if (!place?._id) {
      toast.error("Missing place id");
      return;
    }

    // parse date/time
    const [dd, mm, yyyy] = (payload.date || "").split("/").map(Number);
    const userDate = dd && mm && yyyy ? new Date(yyyy, mm - 1, dd) : null;
    const userTimeMin = parseUserTimeToMinutes(payload.time);

    if (!payload.name || !payload.email || !payload.phone || !userDate || userTimeMin == null) {
      toast.error("Please fill all fields (valid date & time).");
      return;
    }

    // build open window for selected day
    let openMin = null;
    let closeMin = null;

    if (Array.isArray(weekly) && weekly.length === 7) {
      const code = DAYCODES[userDate.getDay()];
      const row = pickRow(weekly, code);

      if (!row || !row.isOpen) {
        toast.error(`Closed on ${LABEL[code]}.`);
        return;
      }

      openMin = mmFromHHMM24(row.open);
      closeMin = mmFromHHMM24(row.close);
    } else {
      const range = parseDailyRangeFromString(place?.workingHours);
      if (!range) {
        toast.error("Working hours unavailable. Please contact the place.");
        return;
      }
      [openMin, closeMin] = range;
    }

    if (openMin == null || closeMin == null) {
      toast.error("Invalid opening hours configured.");
      return;
    }

    if (userTimeMin < openMin || userTimeMin >= closeMin) {
      const nice = (m) => {
        const h = Math.floor(m / 60);
        const mi = m % 60;
        const ampm = h >= 12 ? "PM" : "AM";
        const hr12 = (h % 12) || 12;
        return `${hr12}:${String(mi).padStart(2, "0")} ${ampm}`;
      };
      toast.error(`Closed at that time. Open window is ${nice(openMin)} – ${nice(closeMin)}.`);
      return;
    }

    const body = {
      placeId: place._id,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      date: payload.date,        // dd/MM/yyyy
      time: payload.time.trim(), // original text
      people: Number(payload.people || 1),
      // optionally include who booked:
      uid: user?.uid || null,
    };

    const { success, message } = await createRegistration(body);
    if (success) {
      toast.success("Registration submitted");
      setShowRegister(false);
    } else {
      toast.error(message || "Registration failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!place) return <div className="p-10 text-center">Place not found</div>;

  const details = [
    { icon: <FiMapPin />, label: "Location", value: place.location },
    { icon: <FiMap />, label: "District", value: place.district },
    { icon: <FiTag />, label: "Category", value: place.category },
    { icon: <FiPhone />, label: "Contact", value: place.contactNumber },
    { icon: <FiClock />, label: "Hours", value: place.workingHours },
    { icon: <MdPets />, label: "Pets Allowed", value: place.petsAllowed ? "Yes" : "No" },
  ];

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
        <div className="mb-6">
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

        {/* About */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-gray-700">{place.description}</p>
        </section>

        {/* Details / Map / Reviews + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
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
                            <BsPatchCheckFill className="w-3 h-3 text-green-700" />
                          </span>
                          <p className="text-xs text-gray-600">Verified Buyer</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h6 className="font-semibold text-gray-900">{r.title}</h6>
                      <div className="flex items-center mt-2 space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <AiFillStar key={i} className="w-[18px] h-[18px] text-yellow-400" />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{r.time}</span>
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

          {/* RIGHT: sidebar widgets */}
          <aside className="space-y-4 lg:col-span-1 lg:self-start lg:mt-1">
            {/* Hours – premium card */}
            <div className="w-full">
              <div className="rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setHoursOpen((o) => !o)}
                  aria-expanded={hoursOpen}
                  className="group w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl">
                      <FiClock className="text-gray-700" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      Hours
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {Array.isArray(weekly) ? (
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                          openNow
                            ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                            : "bg-red-100 text-red-600 ring-1 ring-red-200"
                        }`}
                        title={nextOpenInfo(weekly)}
                      >
                        {openNow ? "Open now" : "Closed now"}
                      </span>
                    ) : null}

                    <span
                      className={`transition-transform duration-300 text-gray-700 ${
                        hoursOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▲
                    </span>
                  </div>
                </button>

                {/* Subline */}
                {Array.isArray(weekly) && (
                  <div className="px-4 pb-2 -mt-1">
                    <p className="text-[11px] text-gray-600">
                      {nextOpenInfo(weekly)}
                    </p>
                  </div>
                )}

                {/* Content */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    hoursOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="px-3 pb-3">
                    {Array.isArray(weekly) && weekly.length === 7 ? (
                      <ul className="divide-y divide-gray-200/80 rounded-xl overflow-hidden border border-gray-200/70">
                        {ORDER.map((code) => {
                          const row = pickRow(weekly, code);
                          const dayOpen = row?.isOpen;
                          const isToday = code === todayCode();
                          const timeText = dayOpen
                            ? `${to12h(row.open)} – ${to12h(row.close)}`
                            : "Closed";
                          return (
                            <li
                              key={code}
                              className={`flex items-center justify-between px-4 py-2.5 ${
                                isToday ? "bg-gray-50" : "bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                                    dayOpen ? "bg-emerald-500" : "bg-rose-500"
                                  } ${isToday ? "" : "opacity-70"}`}
                                  aria-hidden
                                />
                                <span
                                  className={`text-[13px] ${
                                    isToday
                                      ? "font-semibold text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {LABEL[code]}
                                </span>
                                {isToday && (
                                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-gray-700">
                                    Today
                                  </span>
                                )}
                              </div>

                              <span
                                className={`text-[13px] tabular-nums tracking-tight ${
                                  dayOpen
                                    ? "text-gray-900 font-medium"
                                    : "text-rose-600 font-medium"
                                }`}
                              >
                                {timeText}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="p-3 rounded-xl border border-gray-200/70 bg-white">
                        <p className="text-xs text-gray-600 mb-1">Standard hours</p>
                        <p className="text-sm font-medium text-gray-900">
                          {place.workingHours || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Button */}
            <div className="w-full">
              <button
                className="w-[220px] py-2 text-sm text-white bg-black rounded-lg hover:bg-gray-900 transition"
                onClick={handleOpenRegister} // 👈 guard here
              >
                Register
              </button>
            </div>

            {/* Live Count (static placeholder) */}
            <div className="w-full mt-3">
              <div className="w-[220px] flex items-center justify-between p-2 text-sm border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FiUser className="text-xl text-gray-700" />
                  <span className="w-2 h-2 bg-green-500 rounded-full block" />
                  <span className="font-medium">Live count</span>
                </div>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <RegisterModal
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSubmit={handleRegisterSubmit}
          placeName={place?.name}
        />
      )}
    </div>
  );
};

export default PlacePreview;
