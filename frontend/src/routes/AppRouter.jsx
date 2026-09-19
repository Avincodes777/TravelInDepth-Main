import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";

// Eager load critical home page
import HomePage from "../pages/HomePage";

// Lazy load all secondary and admin routes for fast initial bundle & instant navigation
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const DestinationPage = lazy(() => import("../pages/DestinationPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignUpPage = lazy(() => import("../pages/SignUpPage"));
const ForgotPage = lazy(() => import("../pages/ForgotPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const CityPage = lazy(() => import("../pages/CityPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ExperiencePage = lazy(() => import("../pages/ExperiencePage"));
const BookTripPage = lazy(() => import("../pages/BookTripPage"));
const ReviewsPage = lazy(() => import("../pages/ReviewsPage"));
const ComingSoonPage = lazy(() => import("../pages/ComingSoonPage"));

// Lazy load admin pages
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const AdminPlacesPage = lazy(() => import("../pages/admin/AdminPlacesPage"));
const AdminPlaceFormPage = lazy(() => import("../pages/admin/AdminPlaceFormPage"));
const AdminSubmissionsPage = lazy(() => import("../pages/admin/AdminSubmissionsPage"));
import ProtectedRoute from "../routes/ProtectedRoute";

const RouteLoader = () => (
  <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{
      width: 36,
      height: 36,
      border: "3px solid rgba(255,107,26,0.2)",
      borderTopColor: "#FF6B1A",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

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
        <Suspense fallback={<RouteLoader />}>
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
        </Suspense>
        </>
    );
}

export default AppRouter;