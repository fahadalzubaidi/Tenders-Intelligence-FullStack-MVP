import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TendersListing from "./pages/TendersListing";
import OpportunityDetail from "./pages/OpportunityDetail";
import CompanyIntelligence from "./pages/CompanyIntelligence";
import MarketViews from "./pages/MarketViews";
import MarketInsights from "./pages/MarketInsights";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/tenders" element={<ProtectedRoute><Layout><TendersListing /></Layout></ProtectedRoute>} />
      <Route path="/opportunity" element={<ProtectedRoute><Layout><OpportunityDetail /></Layout></ProtectedRoute>} />
      <Route path="/opportunity/:id" element={<ProtectedRoute><Layout><OpportunityDetail /></Layout></ProtectedRoute>} />
      <Route path="/company" element={<ProtectedRoute><Layout><CompanyIntelligence /></Layout></ProtectedRoute>} />
      <Route path="/market-views" element={<ProtectedRoute><Layout><MarketViews /></Layout></ProtectedRoute>} />
      <Route path="/market-insights" element={<ProtectedRoute><Layout><MarketInsights /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
