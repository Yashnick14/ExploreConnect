import React, { useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import dashboardImage from "../../assets/dashboard3.jpg";
import { useUserStore } from "@/store/User/user"; // adjust path if needed
import { usePlaceStore } from "@/store/Place/place";
import members from "../../assets/members.jpg";
import topPlaces from "../../assets/mount2.jpg";
import registeredPlaces from "../../assets/registeredplaces.jpg";

// Banner Component
const HeaderBanner = () => {
  return (
    <div className="w-full relative rounded-lg md:rounded-xl overflow-hidden shadow-lg">
      {/* Background Image */}
      <img
        src={dashboardImage}
        alt="Dashboard Banner"
        className="w-full h-24 sm:h-32 md:h-48 lg:h-60 xl:h-72 2xl:h-80 object-cover"
      />

      {/* Overlay Text */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center px-2 sm:px-3 md:px-4">
        <p className="text-xs sm:text-sm md:text-base leading-tight sm:leading-relaxed max-w-xs sm:max-w-xl">
          Welcome to the control center. Monitor users, manage places, and view insights all in one place.
        </p>
      </div>
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
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      {/* Main Content Area - Scrollable with responsive sidebar widths */}
      <div className="flex-1 overflow-x-auto ml-48 sm:ml-56 md:ml-64">
        <div className="min-w-72 sm:min-w-80 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
          <HeaderBanner />

          {/* Cards section with responsive spacing and grid */}
          <section className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 xl:mt-12 2xl:mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 min-w-72 sm:min-w-80">
              
              {/* Card 1 – Members */}
              <div className="relative rounded-lg md:rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-shadow duration-300">
                <img
                  src={members} 
                  alt="Members"
                  className="w-full h-28 sm:h-32 md:h-40 lg:h-44 xl:h-48 2xl:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex flex-col justify-center items-center text-white text-center px-1">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold tracking-wide">MEMBERS</h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold mt-0.5">{users.length}</p>
                </div>
              </div>

              {/* Card 2 – Top Places */}
              <div className="relative rounded-lg md:rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-shadow duration-300">
                <img
                  src={topPlaces} 
                  alt="Top Places"
                  className="w-full h-28 sm:h-32 md:h-40 lg:h-44 xl:h-48 2xl:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex flex-col justify-center items-center text-white text-center px-1">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold tracking-wide">TOP PLACES</h3>
                </div>
              </div>

              {/* Card 3 – Places Registered */}
              <div className="relative rounded-lg md:rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                <img
                  src={registeredPlaces}
                  alt="Places Registered"
                  className="w-full h-28 sm:h-32 md:h-40 lg:h-44 xl:h-48 2xl:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex flex-col justify-center items-center text-white text-center px-1">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold tracking-wide">PLACES REGISTERED</h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold mt-0.5">{places.length}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;