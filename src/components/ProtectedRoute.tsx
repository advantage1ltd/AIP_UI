import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePageAccess } from '@/contexts/PageAccessContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  path: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, path }) => {
  const { hasAccess, currentRole, isTestMode, testRole } = usePageAccess();

  // If no role is set, redirect to login or home
  if (!currentRole) {
    return <Navigate to="/" replace />;
  }

  // Special case: always allow administrators to access settings
  if (currentRole === 'administrator' && path === '/settings') {
    return <>{children}</>;
  }

  // Check access based on current role or test role
  if (!hasAccess(path)) {
    // If user doesn't have access to this page, redirect to their first accessible page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 