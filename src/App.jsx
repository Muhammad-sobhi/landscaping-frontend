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

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'super_admin' ? "/dashboard" : "/employee/dashboard"} />;
  }
  return children;
};

// 1. Create a sub-component to handle the layout logic
function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Define which paths should be "Full Screen" (No Sidebar, No Dashboard Padding)
  const isPublicPage = location.pathname === '/quote' || location.pathname === '/login';

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden w-full relative">
      {/* 2. Only show Sidebar if Authenticated AND not on the Landing Page */}
      {isAuthenticated && !isPublicPage && <Sidebar />}
      
      <main className={`
        flex-1 min-w-0 w-full transition-all duration-300
        /* 3. Only apply Dashboard margins/padding if it's NOT a public page */
        ${isAuthenticated && !isPublicPage ? 'lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8' : ''}
      `}>
        <div className="w-full max-w-full box-border">
          <Routes>
            {/* PUBLIC ROUTES */}
            {/* <Route path="/quote" element={<LandingPage />} /> */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            
            {/* ROOT REDIRECT */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/quote"} />} />

            {/* PROTECTED DASHBOARD ROOT */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {user?.role === 'super_admin' ? <Dashboard /> : <EmployeeDashboard />}
              </ProtectedRoute>
            } />

            {/* ADMIN ONLY ROUTES */}
            <Route path="/users" element={<ProtectedRoute allowedRoles={['super_admin']}><UsersPage /></ProtectedRoute>} /> 
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['super_admin']}><Analytics /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute allowedRoles={['super_admin']}><Leads /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute allowedRoles={['super_admin']}><Offers /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute allowedRoles={['super_admin']}><Invoices /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><Settings /></ProtectedRoute>} />
            <Route path="/leads/:id" element={<ProtectedRoute allowedRoles={['super_admin']}><LeadDetails /></ProtectedRoute>} />
            <Route path="/offers/:id" element={<ProtectedRoute allowedRoles={['super_admin']}><OfferDetails /></ProtectedRoute>} />
            <Route path="/content-manager" element={<ProtectedRoute allowedRoles={['super_admin']}><ContentManager /></ProtectedRoute>} />
            {/* SHARED PROTECTED ROUTES */}
            <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
            <Route path="/jobs/:id/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute allowedRoles={['super_admin']}><Expenses /></ProtectedRoute>} />
            <Route path="/testimonials" element={<ProtectedRoute allowedRoles={['super_admin']}><TestimonialManager /></ProtectedRoute>} />
            {/* EMPLOYEE SPECIFIC */}
            <Route path="/employee/dashboard" element={
              <ProtectedRoute allowedRoles={['employee', 'technician']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// 4. Wrap the AppContent in the Router
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}