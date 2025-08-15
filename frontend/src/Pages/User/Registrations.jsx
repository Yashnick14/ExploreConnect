// src/Pages/User/MyRegistrations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useRegistrationStore } from "@/store/User/Registration";
import { useAuthStore } from "@/store/Auth/auth";
import { usePlaceStore } from "@/store/Place/place";
import { Link } from "react-router-dom";

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

const StatusPill = ({ status }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`px-2 py-1 rounded-sm text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status || "pending"}
    </span>
  );
};

export default function MyRegistrations() {
  const { user, loadUserFromStorage } = useAuthStore();
  const { registrations, fetchRegistrations } = useRegistrationStore();
  const { places, fetchPlaces } = usePlaceStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUserFromStorage?.(); }, [loadUserFromStorage]);

  useEffect(() => {
    (async () => {
      if (!user?.email) { setLoading(false); return; }
      await fetchRegistrations({ email: user.email });
      setLoading(false);
    })();
  }, [user?.email, fetchRegistrations]);

  useEffect(() => {
    if (!places || places.length === 0) fetchPlaces();
  }, [places?.length, fetchPlaces]);

  // id -> place from the store (this is what the navbar uses)
  const placeIndex = useMemo(() => {
    const idx = Object.create(null);
    (places || []).forEach((p) => { idx[p._id] = p; });
    return idx;
  }, [places]);

  const rows = useMemo(() => registrations || [], [registrations]);

  if (!user?.email) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-2xl font-bold mb-2">My Registrations</h1>
        <p className="text-gray-600">Please log in to view your registrations.</p>
      </div>
    );
  }

  // Resolve display info: prefer populated fields for name/district,
  // but ALWAYS fall back to store for images (like navbar).
  const resolveDisplay = (r) => {
    let id = null, pop = null;
    if (typeof r.place === "string") id = r.place;
    else if (r.place && typeof r.place === "object") { id = r.place._id; pop = r.place; }

    const fromStore = id ? placeIndex[id] : null;

    const name = pop?.name ?? fromStore?.name ?? "—";
    const district = pop?.district ?? fromStore?.district;
    const imageFile = fromStore?.images?.[0] ?? pop?.images?.[0] ?? null; // <-- key fix

    return { id, name, district, imageFile };
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Registrations</h1>
        <Link to="/places" className="text-sm text-blue-600 hover:underline">Browse places</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="min-w-[980px] w-full border-separate border-spacing-y-3">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Place</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">People</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-500">Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                  You don’t have any registrations yet.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const info = resolveDisplay(r);
                const imgSrc = info.imageFile
                  ? `http://localhost:5000/uploads/${info.imageFile}` // EXACT navbar way
                  : null;

                return (
                  <tr key={r._id} className="bg-white shadow-sm hover:shadow-md">
                    <td className="px-4 py-3">{idx + 1}</td>

                    <td className="px-4 py-3">
                      <Link to={info.id ? `/places/${info.id}` : "#"} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 border">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={info.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:underline">
                            {info.name}
                          </div>
                          {info.district && (
                            <div className="text-xs text-gray-500">{info.district}</div>
                          )}
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-3">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3">{r.time || "-"}</td>
                    <td className="px-4 py-3">{r.people ?? 1}</td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
