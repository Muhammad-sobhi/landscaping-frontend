import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 1. Wait for AuthContext to finish checking localStorage/API
  if (loading) {
    return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">Verifying Session...</div>;
  }

  // 2. If not logged in, send them straight to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /**
   * 3. Role-Based Access Control
   * If the route requires a specific role (like 'super_admin') 
   * and the user doesn't have it, redirect them to the universal /dashboard.
   * App.jsx will then automatically show them their correct Employee view.
   */
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};