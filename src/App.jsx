import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import EmployeeDashboard from './components/EmployeeDashboard';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Offers from './pages/Offers'; 
import OfferDetails from './pages/OfferDetails';
import Invoices from './components/Invoices';
import UsersPage from './pages/UsersPage';
import Earnings from './pages/Earnings';
import ContentManager from './pages/ContentManager';
import TestimonialManager from './pages/Testimonials';

// Updated ProtectedRoute to be more concise
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show nothing or a loader while checking auth status
  if (loading) return null; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If unauthorized, send back to the main dashboard gate
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Login is the primary public page now
  const isPublicPage = location.pathname === '/login' || location.pathname === '/quote';

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden w-full relative">
      {/* Sidebar only shows if logged in AND not on a public page */}
      {isAuthenticated && !isPublicPage && <Sidebar />}
      
      <main className={`
        flex-1 min-w-0 w-full transition-all duration-300
        ${isAuthenticated && !isPublicPage ? 'lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8' : ''}
      `}>
        <div className="w-full max-w-full box-border">
          <Routes>
            {/* 1. THE DEFAULT DOOR: Redirect to dashboard if logged in, else login */}
            <Route path="/" element={
              isAuthenticated 
                ? <Navigate to="/dashboard" replace /> 
                : <Navigate to="/login" replace />
            } />

            {/* 2. LOGIN: Redirect to dashboard if already logged in */}
            <Route path="/login" element={
              !isAuthenticated 
                ? <Login /> 
                : <Navigate to="/dashboard" replace />
            } />
            
            <Route path="/quote" element={<div>Quote Page Content</div>} /> 

            {/* 3. THE SMART DASHBOARD: Switches view based on role */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {user?.role === 'super_admin' ? <Dashboard /> : <EmployeeDashboard />}
              </ProtectedRoute>
            } />

            {/* ADMIN ONLY ROUTES */}
            <Route path="/users" element={<ProtectedRoute allowedRoles={['super_admin']}><UsersPage /></ProtectedRoute>} /> 
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['super_admin']}><Analytics /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute allowedRoles={['super_admin']}><Leads /></ProtectedRoute>} />
            <Route path="/leads/:id" element={<ProtectedRoute allowedRoles={['super_admin']}><LeadDetails /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute allowedRoles={['super_admin']}><Offers /></ProtectedRoute>} />
            <Route path="/offers/:id" element={<ProtectedRoute allowedRoles={['super_admin']}><OfferDetails /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute allowedRoles={['super_admin']}><Invoices /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><Settings /></ProtectedRoute>} />
            <Route path="/content-manager" element={<ProtectedRoute allowedRoles={['super_admin']}><ContentManager /></ProtectedRoute>} />
            <Route path="/testimonials" element={<ProtectedRoute allowedRoles={['super_admin']}><TestimonialManager /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute allowedRoles={['super_admin']}><Expenses /></ProtectedRoute>} />
            
            {/* SHARED PROTECTED ROUTES */}
            <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
            <Route path="/jobs/:id/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            
            {/* 4. CATCH-ALL: Sends everything back to the root "/" logic */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}