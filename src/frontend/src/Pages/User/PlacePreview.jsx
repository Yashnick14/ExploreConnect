// src/Pages/User/PlacePreview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiHeart,
  FiMapPin,
  FiMap,
  FiTag,
  FiPhone,
  FiClock,
} from "react-icons/fi";
import { MdPets } from "react-icons/md";
import { BsPatchCheckFill } from "react-icons/bs";
import { AiFillStar } from "react-icons/ai";
import { FaHeart } from "react-icons/fa";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAuthStore } from "@/store/Auth/auth";
import { usePlaceStore } from "@/store/Place/place";
import { useRegistrationStore } from "@/store/User/Registration";
import { useFavoritesStore } from "@/store/User/Favorite";
import { useReviewStore } from "@/store/User/Review";

import RegisterModal from "@/Components/RegisterModal";
import PlaceMap from "@/Components/PlaceMap";
import WeatherWidget from "@/Components/WeatherWidget";
import WeatherFX from "@/Components/WeatherFX";

/* ------------------ hours helpers ------------------ */
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
const pickRow = (weekly, code) =>
  Array.isArray(weekly)
    ? weekly.find(
        (d) => d.day === code || d.key === code || d.label === LABEL[code]
      ) || null
    : null;
const isOpenNow = (weekly) => {
  if (!Array.isArray(weekly)) return false;
  const now = new Date();
  const code = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  const row = pickRow(weekly, code);
  if (!row || !row.isOpen) return false;
  const [oh, om] = row.open.split(":").map(Number);
  const [ch, cm] = row.close.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= oh * 60 + om && nowMin <= ch * 60 + cm;
};

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

/* --------------- registration helpers --------------- */
const mmFromHHMM24 = (hhmm) =>
  /^\d{2}:\d{2}$/.test(hhmm)
    ? hhmm
        .split(":")
        .map(Number)
        .reduce((h, m) => h * 60 + m)
    : null;
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
  return start == null || end == null ? null : [start, end];
};

const PlacePreview = () => {
  const { id } = useParams();
  const { getPlaceById } = usePlaceStore();
  const { createRegistration, hasBlockedRegistration } = useRegistrationStore();
  const { user, loadUserFromStorage } = useAuthStore();
  const { favoriteIds, fetchFavorites, toggleFavorite } = useFavoritesStore();
  const { reviews, fetchReviews } = useReviewStore();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isFav = useMemo(
    () => (place?._id ? favoriteIds.has(place._id) : false),
    [favoriteIds, place?._id]
  );

  useEffect(() => {
    loadUserFromStorage?.();
    const unsub = onAuthStateChanged(getAuth(), (fbUser) =>
      setIsAnonymous(!!fbUser?.isAnonymous)
    );
    return () => unsub();
  }, [loadUserFromStorage]);

  useEffect(() => {
    (async () => {
      const res = await getPlaceById(id);
      if (res.success) {
        setPlace(res.data);
        await fetchReviews(res.data._id);
      } else toast.error(res.message || "Place not found");
      setLoading(false);
    })();
  }, [id, getPlaceById, fetchReviews]);

  useEffect(() => {
    if (user?.email && !isAnonymous) {
      fetchFavorites(user.email);
    }
  }, [user?.email, isAnonymous, fetchFavorites]);

  const initialRegValues = useMemo(
    () => ({
      name: user?.fullName || user?.username || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || user?.phoneNumber || "",
      people: 1,
    }),
    [user]
  );

  const weekly = useMemo(() => {
    let w = place?.workingHoursWeekly;
    try {
      if (typeof w === "string") w = JSON.parse(w);
    } catch (err) {
      console.debug("Invalid workingHoursWeekly", err);
    }
    return w;
  }, [place]);

  const openNow = useMemo(() => isOpenNow(weekly), [weekly]);

  const handleOpenRegister = () => {
    if (!user) return toast.error("Please sign in first.");
    if (isAnonymous)
      return toast.error(
        "You’re currently signed in as a guest. Please register first."
      );
    if (user.status && user.status !== "active")
      return toast.error("Your account is not active.");
    setShowRegister(true);
  };

  const handleFavoriteClick = async () => {
    if (!user) return toast.error("Please sign in first.");
    if (isAnonymous)
      return toast.error(
        "You’re currently signed in as a guest. Please register first."
      );
    if (!place?._id) return;

    const { success, message } = await toggleFavorite(user.email, place._id);
    if (!success) {
      toast.error(message || "Failed to update favorites");
      return;
    }
    toast.success(
      favoriteIds.has(place._id)
        ? "Removed from favorites"
        : "Added to favorites"
    );
  };

  const handleRegisterSubmit = async (payload) => {
    if (!place?._id) return toast.error("Missing place id");

    const [dd, mm, yyyy] = (payload.date || "").split("/").map(Number);
    const userDate = dd && mm && yyyy ? new Date(yyyy, mm - 1, dd) : null;
    const userTimeMin = parseUserTimeToMinutes(payload.time);
    if (
      !payload.name ||
      !payload.email ||
      !payload.phone ||
      !userDate ||
      userTimeMin == null
    )
      return toast.error("Please fill all fields (valid date & time).");

    try {
      const { exists } = await hasBlockedRegistration({
        email: (user?.email || payload.email || "").trim(),
        placeId: place._id,
        date: payload.date,
      });
      if (exists) {
        return toast.error(
          "You already have a registration (pending/approved) for this place on this date."
        );
      }
    } catch (err) {
      console.warn("hasBlockedRegistration failed:", err);
    }

    let openMin = null,
      closeMin = null;
    if (Array.isArray(weekly) && weekly.length === 7) {
      const code = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        userDate.getDay()
      ];
      const row = pickRow(weekly, code);
      if (!row?.isOpen) return toast.error(`Closed on ${LABEL[code]}.`);
      openMin = mmFromHHMM24(row.open);
      closeMin = mmFromHHMM24(row.close);
    } else {
      const range = parseDailyRangeFromString(place?.workingHours);
      if (!range)
        return toast.error(
          "Working hours unavailable. Please contact the place."
        );
      [openMin, closeMin] = range;
    }
    if (openMin == null || closeMin == null)
      return toast.error("Invalid opening hours configured.");
    if (userTimeMin < openMin || userTimeMin >= closeMin) {
      const nice = (m) => {
        const h = Math.floor(m / 60),
          mi = m % 60,
          ampm = h >= 12 ? "PM" : "AM",
          hr12 = h % 12 || 12;
        return `${hr12}:${String(mi).padStart(2, "0")} ${ampm}`;
      };
      return toast.error(
        `Closed at that time. Open window is ${nice(openMin)} – ${nice(closeMin)}.`
      );
    }

    const body = {
      placeId: place._id,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      date: payload.date,
      time: payload.time.trim(),
      people: Number(payload.people || 1),
      uid: user?.uid || null,
    };

    const { success, message } = await createRegistration(body);
    if (success) {
      toast.success("Registration submitted");
      setShowRegister(false);
    } else toast.error(message || "Registration failed");
  };

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

  const lat = parseFloat(place.lat);
  const lng = parseFloat(place.lng);
  const hasCoords = !isNaN(lat) && !isNaN(lng);

  return (
    <div className="pt-[100px] bg-gray-100">
      {hasCoords && (
        <WeatherFX
          lat={lat}
          lng={lng}
          duration={3500}
          lookaheadHours={3}
          probThreshold={30}
          amountThreshold={0.05}
          maxDrops={120}
          rainDarken={0.48}
          rainVignette
          rainMist
          sunSize={125}
          sunBeamCount={36}
          sunCornerInset={45}
          sunOnOvercastIfDry={true}
          timezone="Asia/Colombo"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {place.name}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFavoriteClick}
              aria-pressed={isFav}
              className={`inline-flex items-center gap-2 rounded-sm px-3 py-1 border transition
                ${
                  isFav
                    ? "bg-gray-100 border-gray-400 text-red-600"
                    : "bg-gray-100 border-gray-400 text-gray-700 hover:text-gray-900"
                }`}
              title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              {isFav ? (
                <FaHeart className="text-xl" />
              ) : (
                <FiHeart className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Hero images */}
        {place.images?.length ? (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <img
                src={`http://localhost:5000/uploads/${place.images[0]}`}
                alt="Main"
                className="w-full h-[420px] object-cover"
              />
            </div>
            {place.images.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {place.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-gray-200"
                  >
                    <img
                      src={`http://localhost:5000/uploads/${img}`}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-[200px] object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* About card */}
        <section>
          <div className="px-6 py-5">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">About</h2>
            <p className="text-gray-700 leading-relaxed">{place.description}</p>
          </div>
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Details card */}
            <section>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {details.map((d, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="text-2xl text-blue-600/90">{d.icon}</div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {d.label}
                        </p>
                        <p className="mt-0.5 font-medium text-gray-900">
                          {d.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Map */}
            {hasCoords && (
              <section>
                <div className="px-6 pt-5">
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">
                    Location on Map
                  </h2>
                </div>
                <div className="px-4 sm:px-6">
                  <PlaceMap
                    dest={{ lat, lng }}
                    name={place.name}
                    height={320}
                    zoom={13}
                  />
                </div>
                <div className="px-6 pb-5" />
              </section>
            )}

            {/* Reviews card */}
            <section>
              <div className="px-6 py-5">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  All reviews
                </h2>
                <div className="divide-y divide-gray-200">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                  ) : (
                    reviews.map((r, idx) => (
                      <div key={idx} className="py-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              r.user?.avatar ||
                              "https://placehold.co/48x48?text=👤"
                            }
                            alt={r.user?.fullName || "User"}
                            className="w-12 h-12 rounded-full border-2 border-gray-300"
                          />
                          <div>
                            <p className="text-[15px] font-semibold text-gray-900">
                              {r.user?.fullName ||
                                r.user?.username ||
                                r.user?.email ||
                                "Traveller"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-600/20">
                                <BsPatchCheckFill className="w-3 h-3 text-green-700" />
                              </span>
                              <p className="text-xs text-gray-600">
                                Verified Traveller
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h6 className="font-semibold text-gray-900">
                            {r.title}
                          </h6>
                          <div className="flex items-center mt-2 space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <AiFillStar
                                key={i}
                                className={`w-[18px] h-[18px] ${
                                  i < r.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
                            {r.comment}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            {/* Hours card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setHoursOpen((o) => !o)}
                aria-expanded={hoursOpen}
                className="group w-full flex items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-50">
                    <FiClock className="text-gray-700" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    Hours
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {Array.isArray(weekly) && (
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
                  )}
                  <span
                    className={`transition-transform ${
                      hoursOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▲
                  </span>
                </div>
              </button>

              {Array.isArray(weekly) && (
                <div className="px-5 pb-2 -mt-2">
                  <p className="text-[11px] text-gray-600">
                    {nextOpenInfo(weekly)}
                  </p>
                </div>
              )}

              <div
                className={`grid transition-all duration-300 ${
                  hoursOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-4 pb-5">
                  {Array.isArray(weekly) && weekly.length === 7 ? (
                    <ul className="divide-y divide-gray-200 rounded-xl overflow-hidden border border-gray-200">
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
                              className={`text-[13px] tabular-nums ${
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
                    <div className="p-3 rounded-xl border border-gray-200 bg-white">
                      <p className="text-xs text-gray-600 mb-1">
                        Standard hours
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {place.workingHours || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Register button */}
            <div>
              <button
                className="w-full py-2.5 text-sm text-white bg-black rounded-lg hover:bg-gray-900 transition"
                onClick={handleOpenRegister}
              >
                Register
              </button>
            </div>

            {/* Weather */}
            {hasCoords && (
              <WeatherWidget
                lat={lat}
                lng={lng}
                title={`${place.name} • Forecast`}
                className="w-full"
              />
            )}
          </aside>
        </div>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <RegisterModal
          key={user?.email || "guest"}
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSubmit={handleRegisterSubmit}
          placeName={place?.name}
          initial={initialRegValues}
        />
      )}
    </div>
  );
};

export default PlacePreview;
