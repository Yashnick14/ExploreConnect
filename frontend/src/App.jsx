import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./Pages/Home/HomePage";
import Navbar from "./Components/Navbar";
import { Toaster } from "react-hot-toast";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import ResetPassword from "./Pages/Auth/ResetPassword";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import AdminDashboard from "./Pages/Admin/Dashboard";
import Places from "./Pages/User/ViewPlaces";
import PlaceManagement from "./Pages/Admin/PlaceManagement";
import Footer from "./Components/Footer";
import Membership from "./Pages/User/Membership";
import Profile from "./Pages/User/Profile";
import About from "./Pages/User/About";
import UserManagement from "./Pages/Admin/UserManagement";
import PlacePreview from "./Pages/User/PlacePreview";
import GoogleTranslate from "./Components/GoogleTranslate";
import RegistrationManagement from "./Pages/Admin/RegistrationManagement";
import MyRegistrations from "@/Pages/User/Registrations";
import Favorites from "./Pages/User/Favorites";



function App() {

  const location = useLocation();
  const adminRoutes = [
    "/",
    "/admin-dashboard",
    "/user-management",
    "/place-management",
    "/register",
    "/login",
    "/reset-password",
    "/forgot-password",
    "/registration-management"
  ];
  const isAdminRoute = adminRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar (not shown on admin routes) */}
      {!isAdminRoute && <Navbar />}

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          {/* Landing page now points to Login */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:id" element={<PlacePreview />} />
          <Route path="/place-management" element={<PlaceManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/registration-management" element={<RegistrationManagement />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/registrations" element={<MyRegistrations />} />
          <Route path="/about" element={<About />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>

      {/* Toaster */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Footer (not shown on admin routes) */}
      {!isAdminRoute && <Footer />}

    <div className="fixed bottom-4 right-4 z-50">
        <GoogleTranslate />
      </div>

    </div>
  );
}

export default App;
