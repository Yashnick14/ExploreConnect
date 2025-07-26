import React, { useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import dashboardImage from "../../assets/dashboard.jpg";
import { useUserStore } from "@/store/User/user"; // adjust path if needed
import { usePlaceStore } from "@/store/Place/place";

// Banner Component
const HeaderBanner = () => {
  return (
    <div className="w-full">
      <img
        src={dashboardImage}
        alt="Dashboard Banner"
        className="w-full h-64 object-cover rounded-xl shadow"
      />
    </div>
  );
};

// Admin Dashboard Page
const AdminDashboard = () => {
  const { users, fetchUsers } = useUserStore();
  const { places, fetchPlaces } = usePlaceStore();
    useEffect(() => {
    fetchUsers();
    fetchPlaces();
  }, [fetchUsers, fetchPlaces]);

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        <HeaderBanner />

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 – Members */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1508780709619-79562169bc64"
              alt="Members"
              className="w-full h-60 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center">
              <h3 className="text-lg font-semibold tracking-wide">MEMBERS</h3>
              <p className="text-xl font-bold mt-1">{users.length}</p>
            </div>
          </div>

          {/* Card 2 – Top Places */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
              alt="Top Places"
              className="w-full h-60 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center">
              <h3 className="text-lg font-semibold tracking-wide">TOP PLACES</h3>
            </div>
          </div>

          {/* Card 3 – Places Registered */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1526470608268-f674ce90ebd4"
              alt="Places Registered"
              className="w-full h-60 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center">
              <h3 className="text-lg font-semibold tracking-wide">PLACES REGISTERED</h3>
              <p className="text-xl font-bold mt-1">{places.length}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
