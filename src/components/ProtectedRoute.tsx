import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // Guest routes can be accessed by anyone
  return <>{children}</>;
};
