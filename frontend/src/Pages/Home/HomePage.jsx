import React, { useEffect, useState } from "react";
import { usePlaceStore } from "@/store/Place/place";
import PlaceCard from "../../Components/PlaceCard";
import heroImage1 from "../../assets/mount8.jpg";
import heroImage2 from "../../assets/mount7.jpg";
import heroImage3 from "../../assets/deers.jpg";
import infoImage from "../../assets/mount10.jpg";
import { CiSearch } from "react-icons/ci";

const HomePage = () => {
  const { fetchLatestPlaces, latestPlaces } = usePlaceStore();

  const heroSections = [
    {
      image: heroImage1,
      heading: (
        <>
          <span className="hidden lg:inline">ESCAPE. EXPLORE. RECONNECT</span>
          <span className="block lg:hidden">
            ESCAPE. EXPLORE.
            <br />
            RECONNECT
          </span>
        </>
      ),
      subtext: "FIND AND RESERVE GREEN SPACES IN SECONDS",
    },
    {
      image: heroImage2,
      heading: "DISCOVER NATURE'S HIDDEN GEMS",
      subtext: "UNLOCK ACCESS TO EXCLUSIVE OUTDOOR LOCATIONS",
    },
    {
      image: heroImage3,
      heading: "PLAN YOUR NEXT ADVENTURE",
      subtext: "BOOK ECO-FRIENDLY RETREATS QUICKLY AND EASILY",
    },
  ];

  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    fetchLatestPlaces();
  }, [fetchLatestPlaces]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroSections.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <header className="relative h-[100vh] overflow-hidden pt-[80px] lg:pt-0">
        {heroSections.map((hero, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === activeHero ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${hero.image})` }}
            >
              <div className="w-full h-full bg-black/30 flex items-center justify-center text-center text-white px-4 md:px-6">
                <div className="animate-fade-in-up max-w-2xl w-full px-2 sm:px-6">
                  <h1
                    className={`hero-heading ${
                      index === 0
                        ? "text-center lg:text-center"
                        : "text-center"
                    } text-4xl sm:text-5xl font-bold uppercase tracking-wider mb-4 leading-tight`}
                  >
                    {hero.heading}
                  </h1>
                  <p className="text-center text-base sm:text-lg uppercase mb-6 px-2">
                    {hero.subtext}
                  </p>

                  {/* {index === 0 && (
                    <div className="flex items-center justify-center bg-white/20 border border-white/30 backdrop-blur-md rounded-full h-10 max-w-[340px] sm:max-w-[380px] w-full mx-auto shadow-lg px-4">
                      <CiSearch className="text-white text-lg mr-2" />
                      <input
                        type="text"
                        placeholder="Search places..."
                        className="flex-1 bg-transparent outline-none text-white placeholder-white/80 text-sm sm:text-base"
                      />
                    </div>
                  )} */}

                  {index === 1 && (
                    <button className="mt-4 px-6 py-2 text-sm font-semibold bg-white/10 border border-white/30 rounded-full backdrop-blur-md hover:bg-white/20 transition">
                      Discover More
                    </button>
                  )}

                  {index === 2 && (
                    <button className="mt-4 px-6 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-green-700 rounded-full shadow-lg hover:opacity-90 transition">
                      Start Planning
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Capsule-style Slide Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4 z-30">
          {heroSections.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveHero(index)}
              className={`w-10 h-2 rounded-full transition-all duration-300 ${
                activeHero === index
                  ? "bg-white"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            ></button>
          ))}
        </div>
      </header>

      {/* Trip Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-gray-100 via-gray-100 to-indigo-100 text-center">
        <h2 className="text-3xl font-bold text-indigo-800 mb-10 tracking-wide">
          Plan Your Trip
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
          {latestPlaces.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))}
        </div>
      </section>

      {/* Info Banner */}
      <section
        className="relative bg-cover bg-center bg-no-repeat text-white py-16 px-6 text-center shadow-xl z-10"
        style={{ backgroundImage: `url(${infoImage})` }}
      >
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Interagency & Site Passes</h2>
          <p className="text-lg text-gray-100 mb-6">
            Whether you're planning a single visit, coming back throughout the
            year, or traveling to multiple destinations, enjoy the convenience
            of purchasing a daily, weekly, seasonal, or annual pass to cover
            admissions, recreation, or amenity fees for your trips.
          </p>
          <button className="px-10 py-3 rounded-full font-bold text-white bg-gradient-to-r from-blue-900 to-blue-700 shadow-md hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition">
            Learn More
          </button>
        </div>
      </section>
      <br />
    </>
  );
};

export default HomePage;
