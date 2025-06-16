import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePageAccess } from '@/contexts/PageAccessContext';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   path: string;
// }

// Removed duplicate named export to resolve error
// export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, path }) => {
//   const { hasAccess, currentRole, isTestMode, testRole } = usePageAccess();
//   if (!currentRole) {
//     return <Navigate to="/" replace />;
//   }
//   if (currentRole === 'administrator' && path === '/settings') {
//     return <>{children}</>;
//   }
//   if (!hasAccess(path)) {
//     return <Navigate to="/" replace />;
//   }
//   return <>{children}</>;
// };

export default function ProtectedRoute() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { currentRole } = usePageAccess();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const hasValidSession = !!token && !!currentRole;
      setIsAuthenticated(hasValidSession);
      setIsChecking(false);
    };

    // Only check once, avoid continuous re-checking
    if (isChecking) {
      const timeoutId = setTimeout(checkAuth, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentRole, isChecking]);

  // Show loading state during check to prevent flashing
  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
} 