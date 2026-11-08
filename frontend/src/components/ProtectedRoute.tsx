import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { privacyApi } from '../services/api';
import { PrivacyConsentModal } from './privacy/PrivacyConsentModal';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const location = useLocation();
  const [checkingConsent, setCheckingConsent] = useState(true);
  const [hasConsented, setHasConsented] = useState<boolean>(true);
  const [requiredVersion, setRequiredVersion] = useState<string>('1.0');

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated && user) {
      // Validate consent in database via backend
      privacyApi
        .getStatus()
        .then((res) => {
          if (!isMounted) return;
          const { consented, currentVersion } = res.data;
          setRequiredVersion(currentVersion || '1.0');
          setHasConsented(Boolean(consented));
          setCheckingConsent(false);
        })
        .catch(() => {
          if (!isMounted) return;
          // Fallback to locally cached consent version if network is temporarily unreachable
          const cachedVer = localStorage.getItem('masid_privacy_consented_version');
          setHasConsented(cachedVer === '1.0');
          setCheckingConsent(false);
        });
    } else {
      setCheckingConsent(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  if (isLoading || (isAuthenticated && checkingConsent)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <p className="text-gray-500 text-sm font-medium">Verifying authorization and privacy compliance...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'resident') return <Navigate to="/resident/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PrivacyConsentModal
        isOpen={!hasConsented}
        requiredVersion={requiredVersion}
        onConsentSuccess={() => setHasConsented(true)}
        onDeclineLogout={logout}
      />
      {hasConsented ? children : null}
    </>
  );
}

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'admin' || user.role === 'staff') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/resident/dashboard" replace />;
  }

  return <>{children}</>;
}
