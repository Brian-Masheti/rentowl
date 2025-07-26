import React from 'react';
import { Navigate } from 'react-router-dom';

// Dummy function to get user role from localStorage/JWT (replace with real logic)
function getUserRole() {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user).role;
  } catch {
    return null;
  }
}

function PrivateRoute({ children, allowedRoles }) {
  const role = getUserRole();
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default PrivateRoute;
