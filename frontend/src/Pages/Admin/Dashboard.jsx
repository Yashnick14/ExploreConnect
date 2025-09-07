import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import dashboardImage from "../../assets/dashboard3.jpg";
import { useUserStore } from "@/store/User/user";
import { usePlaceStore } from "@/store/Place/place";
import membersImg from "../../assets/users.jpg";
import registeredUsersImg from "../../assets/aboutus.jpg";
import registeredPlacesImg from "../../assets/registeredplaces.jpg";

import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

// ✅ Banner Component
const HeaderBanner = () => (
  <div className="w-full relative rounded-lg md:rounded-xl overflow-hidden shadow-lg">
    <img
      src={dashboardImage}
      alt="Dashboard Banner"
      className="w-full h-24 sm:h-32 md:h-48 lg:h-60 xl:h-72 2xl:h-80 object-cover"
    />
    <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center px-2 sm:px-3 md:px-4">
      <p className="text-xs sm:text-sm md:text-base leading-tight sm:leading-relaxed max-w-xs sm:max-w-xl">
        Welcome to the control center. Monitor users, manage places, and view
        insights all in one place.
      </p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { users, fetchUsers } = useUserStore();
  const { places, fetchPlaces } = usePlaceStore();

  // ✅ One toggle for both charts
  const [range, setRange] = useState("monthly");

  const [chartData, setChartData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchPlaces();
  }, [fetchUsers, fetchPlaces]);

  // ✅ Fetch Revenue
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/stripe/revenue?range=${range}`
        );
        if (res.data.success) {
          setChartData(res.data.data || []);
          setTotalRevenue(
            res.data.data.reduce((sum, item) => sum + item.value, 0)
          );
        }
      } catch (err) {
        console.error("❌ Failed to fetch revenue:", err.message);
      }
    };
    fetchRevenue();
  }, [range]);

  // ✅ Fetch Visitors
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/page-views/visitors?range=${range}`
        );
        if (res.data.success) {
          setVisitorData(res.data.data || []);
          setTotalVisitors(
            res.data.data.reduce((sum, item) => sum + item.value, 0)
          );
        }
      } catch (err) {
        console.error("❌ Failed to fetch visitors:", err.message);
      }
    };
    fetchVisitors();
  }, [range]);

  // ✅ derived stats
  const registeredUsersCount = useMemo(() => users.length, [users]);
  const membersCount = useMemo(
    () => users.filter((u) => u.membership?.isMember === true).length,
    [users]
  );
  const placesCount = useMemo(() => places.length, [places]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 overflow-x-auto ml-48 sm:ml-56 md:ml-64">
        <div className="min-w-72 sm:min-w-80 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
          <HeaderBanner />

          {/* ===== Cards Section ===== */}
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                img: registeredUsersImg,
                title: "REGISTERED USERS",
                value: registeredUsersCount,
              },
              {
                img: membersImg,
                title: "MEMBERS",
                value: membersCount,
              },
              {
                img: registeredPlacesImg,
                title: "PLACES REGISTERED",
                value: placesCount,
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden shadow-lg group hover:shadow-xl h-52" // ✅ fixed same height
              >
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover" // ✅ stretches image to fill container
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ===== Toggle Buttons (Shared) ===== */}
          <div className="flex justify-center gap-2 mt-8">
            {["weekly", "monthly"].map((opt) => (
              <button
                key={opt}
                onClick={() => setRange(opt)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  range === opt
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {/* ===== Charts Section ===== */}
          <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="p-4 bg-gray-200 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-m text-gray-500 mb-2">Membership Revenue</h2>
              <p className="text-2xl font-semibold text-emerald-700 mb-4">
                ${totalRevenue.toFixed(2)}
              </p>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(val) => `$${val}`}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(val) => [`$${val.toFixed(2)}`, "Revenue"]}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Visitors Chart */}
            <div className="p-4 bg-gray-200 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-m text-gray-500 mb-2">Visitors</h2>
              <p className="text-2xl font-semibold text-blue-600 mb-4">
                {totalVisitors.toLocaleString()}
              </p>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={visitorData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(val) => [Math.round(val), "Visitors"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
