import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const LandlordDashboard = lazy(() => import('./components/dashboards/LandlordDashboard'));
const CaretakerDashboard = lazy(() => import('./components/dashboards/CaretakerDashboard'));
const TenantDashboard = lazy(() => import('./components/dashboards/TenantDashboard'));
const SuperAdminDashboard = lazy(() => import('./components/dashboards/SuperAdminDashboard'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
    </Router>
  );
}

export default App;
