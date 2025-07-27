import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import LandlordDashboard from './components/dashboards/LandlordDashboard';
import CaretakerDashboard from './components/dashboards/CaretakerDashboard';
import TenantDashboard from './components/dashboards/TenantDashboard';
import PrivateRoute from './components/PrivateRoute';
import SuperAdminDashboard from './components/dashboards/SuperAdminDashboard';
import AdminLogin from './components/admin/AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/landlord-dashboard"
          element={
            <PrivateRoute allowedRoles={["landlord"]}>
              <LandlordDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/caretaker-dashboard"
          element={
            <PrivateRoute allowedRoles={["caretaker"]}>
              <CaretakerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/tenant-dashboard"
          element={
            <PrivateRoute allowedRoles={["tenant"]}>
              <TenantDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/super-admin-dashboard"
          element={
            <PrivateRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
