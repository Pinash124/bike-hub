import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // 1. Nếu chưa đăng nhập, điều hướng về login và lưu lại trang đang định vào (state)
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 2. Đặc cách: Nếu đang vào trang /kyc thì không kiểm tra requiredRole 
  // vì mọi người dùng đã đăng nhập đều có quyền xác thực.
  if (location.pathname === '/kyc') {
    return <>{children}</>;
  }

  // 3. Kiểm tra vai trò nếu có yêu cầu cụ thể (cho Dashboard)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Nếu role hiện tại không nằm trong danh sách cho phép
    if (!allowedRoles.includes(role)) {
      // Điều hướng về trang chủ thay vì /unauthorized nếu trang đó chưa tồn tại
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Tránh nhấp nháy giao diện khi đang check auth
  }

  // Nếu đã đăng nhập mà cố vào trang Login/Register thì đẩy về Home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};