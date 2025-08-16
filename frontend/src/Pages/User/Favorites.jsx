import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/Auth/auth";
import { useFavoritesStore } from "@/store/User/Favorite";

const Favorites = () => {
  const { user, loadUserFromStorage } = useAuthStore();
  const { favorites, fetchFavorites } = useFavoritesStore();

  useEffect(() => { loadUserFromStorage?.(); }, [loadUserFromStorage]);
  useEffect(() => {
    if (user?.email) fetchFavorites(user.email);
  }, [user?.email, fetchFavorites]);

  if (!user?.email) {
    return (
      <div className="px-6">
        <div className="max-w-6xl mx-auto min-h-[70vh] grid place-content-center text-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Favorites</h1>
            <p className="text-gray-600">Please log in to view your favorites.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Favorites</h1>
        <Link to="/places" className="text-sm text-blue-600 hover:underline">Browse places</Link>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-600 min-h-[40vh] grid place-content-center">
          You don’t have any favorites yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <Link key={p._id} to={`/places/${p._id}`} className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition">
              <div className="w-full h-40 bg-gray-100">
                <img
                  src={`http://localhost:5000/uploads/${p.images?.[0]}`}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900">{p.name}</div>
                {p.district && <div className="text-sm text-gray-600">{p.district}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
