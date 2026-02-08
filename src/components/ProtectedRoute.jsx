import { Navigate } from 'react-router-dom';

export const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role !== 'admin') {
    // If they aren't admin, send them to their own dashboard
    return <Navigate to="/employee/dashboard" replace />;
  }
  
  return children;
};