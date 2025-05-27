import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protected route - Requires authentication
const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <Outlet />;
};

// Admin route - Requires admin privileges
const AdminRoute = () => {
  const { isAdmin } = useSelector(state => state.auth);
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export { ProtectedRoute, AdminRoute };