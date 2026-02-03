import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import TenantSignupPage from "./pages/TenantSignupPage.jsx";
import OwnerSignupPage from "./pages/OwnerSignupPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ListingsPage from "./pages/ListingsPage.jsx";
import RentalDetailsPage from "./pages/RentalDetailsPage.jsx";
import TrustSafetyPage from "./pages/TrustSafetyPage.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import TopNav from "./components/TopNav.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <AuthProvider>
      <TopNav />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup/tenant" element={<TenantSignupPage />} />
        <Route path="/signup/owner" element={<OwnerSignupPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Tenant Protected Routes */}
        <Route
          path="/listings/:city"
          element={
            <ProtectedRoute allowedRoles={["tenant"]}>
              <ListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rental/:id"
          element={
            <ProtectedRoute allowedRoles={["tenant"]}>
              <RentalDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trust-safety"
          element={
            <ProtectedRoute allowedRoles={["tenant"]}>
              <TrustSafetyPage />
            </ProtectedRoute>
          }
        />

        {/* Owner Protected Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}
