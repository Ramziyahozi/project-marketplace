import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import HomePage from "./pages/HomePage";
import WelcomePage from "./pages/WelcomePage";
import Navbar from "./components/layout/Navbar";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import AdminUserListPage from "./pages/AdminUserListPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import CreateStorePage from "./pages/CreateStorePage";
import StoreProfilePage from "./pages/StoreProfilePage";
import OrderReceiptPage from "./pages/OrderReceiptPage";

import useAuthStore from './stores/authStore';
import { PlasmicRootProvider, PlasmicComponent } from "@plasmicapp/loader-react";
import { PLASMIC } from "./plasmic-init";

// Protected Route untuk Create Store
const ProtectedCreateStoreRoute = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // Jika tidak login, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Jika sudah jadi penjual, redirect ke seller dashboard
  if (user?.role === 'penjual') {
    return <Navigate to="/seller-dashboard" replace />;
  }
  
  // Jika sudah punya data toko lengkap, redirect ke profile
  if (user?.store && user.store.name && user.store.address && user.store.category && user.store.phone) {
    return <Navigate to="/profile" replace />;
  }
  
  // Jika semua validasi passed, tampilkan CreateStorePage
  return <CreateStorePage />;
};

// Protected Route untuk Seller Dashboard
const ProtectedSellerRoute = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // Jika tidak login, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Jika bukan penjual, redirect ke profile
  if (user?.role !== 'penjual') {
    return <Navigate to="/profile" replace />;
  }
  
  // Jika semua validasi passed, tampilkan SellerDashboardPage
  return <SellerDashboardPage />;
};

function AppRoutes() {
  const { user, isAuthenticated } = useAuthStore();
  
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin/users" element={<AdminUserListPage />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <HomePage /> : <WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile-setup" element={<ProfileSetupPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/create-store" element={
        <ProtectedCreateStoreRoute />
      } />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-receipt" element={<OrderReceiptPage />} />
      <Route path="/order-history" element={<OrderHistoryPage />} />
      <Route path="/seller-dashboard" element={
        <ProtectedSellerRoute />
      } />
      <Route path="/store-profile" element={<StoreProfilePage />} />
      
      <Route path="/plasmic" element={
        <PlasmicRootProvider loader={PLASMIC}>
          <PlasmicComponent component="Homepage" />
        </PlasmicRootProvider>
      } />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;