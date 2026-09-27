import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';

// ---- Lazy-loaded pages ----
// Public
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const AnnouncementsPage = lazy(() => import('./pages/public/AnnouncementsPage'));
const AnnouncementDetailPage = lazy(() =>
  import('./pages/public/AnnouncementsPage').then(m => ({ default: m.AnnouncementDetailPage }))
);
const EventsPage = lazy(() => import('./pages/public/EventsPage'));
const EventDetailPage = lazy(() =>
  import('./pages/public/EventsPage').then(m => ({ default: m.EventDetailPage }))
);
const PayoutsPage = lazy(() => import('./pages/public/PayoutsPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBeneficiaries = lazy(() => import('./pages/admin/AdminBeneficiaries'));
const AdminPayouts = lazy(() => import('./pages/admin/AdminPayouts'));
const AdminResources = lazy(() => import('./pages/admin/AdminResources'));
const AdminDistribution = lazy(() => import('./pages/admin/AdminDistribution'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Resident
const ResidentDashboard = lazy(() => import('./pages/resident/ResidentDashboard'));

// ---- Loading fallback ----
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading MASID...</p>
      </div>
    </div>
  );
}

// ---- 404 page ----
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="text-7xl font-extrabold text-gray-200 font-display mb-2">404</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="btn btn-primary">
          Back to Home
        </a>
      </div>
    </div>
  );
}

// ---- App ----
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/payouts" element={<PayoutsPage />} />
            <Route path="/resources" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* ===== AUTH ROUTES ===== */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* ===== ADMIN ROUTES ===== */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/beneficiaries"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminBeneficiaries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payouts"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminPayouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminResources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/distribution"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminDistribution />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminAnnouncements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* ===== RESIDENT ROUTES ===== */}
            <Route
              path="/resident/dashboard"
              element={
                <ProtectedRoute allowedRoles={['resident']}>
                  <ResidentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resident/profile"
              element={
                <ProtectedRoute allowedRoles={['resident']}>
                  <ResidentDashboard />
                </ProtectedRoute>
              }
            />

            {/* ===== REDIRECTS ===== */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/resident" element={<Navigate to="/resident/dashboard" replace />} />

            {/* ===== 404 ===== */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
