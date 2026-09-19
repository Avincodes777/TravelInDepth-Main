import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import DestinationPage from "../pages/DestinationPage"
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import ForgotPage from "../pages/ForgotPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminPlacesPage from "../pages/admin/AdminPlacesPage";
import AdminPlaceFormPage from "../pages/admin/AdminPlaceFormPage";
import AdminSubmissionsPage from "../pages/admin/AdminSubmissionsPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import CityPage from "../pages/CityPage";
import DashboardPage from "../pages/DashboardPage";
import AboutPage from "../pages/AboutPage";
import ExperiencePage from "../pages/ExperiencePage";
import BookTripPage from "../pages/BookTripPage";
import ReviewsPage from "../pages/ReviewsPage";

import ComingSoonPage from "../pages/ComingSoonPage";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return null;
}

const AppRouter=()=>{
    return (
        <>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

      {/*Admin side*/}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
              <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/places"
        element={
          <ProtectedRoute adminOnly>
              <AdminPlacesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/submissions"
        element={
          <ProtectedRoute adminOnly>
              <AdminSubmissionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/places/new"
        element={
          <ProtectedRoute adminOnly>
              <AdminPlaceFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/places/:id/edit"
        element={
          <ProtectedRoute adminOnly>
              <AdminPlaceFormPage />
          </ProtectedRoute>
        }
      />
        <Route path="/destinations" element={<DestinationPage />} />
        <Route path="/destinations/:slug" element={<CityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/book-trip" element={<BookTripPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        {/* 404 Page for error*/}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </>
    );
}

export default AppRouter;