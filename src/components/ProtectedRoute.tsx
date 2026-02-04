import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // Sử dụng lucide-react giống các file khác
import type { UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallbackPath?: string;
}

/**
 * Component bảo vệ các tuyến đường yêu cầu đăng nhập và phân quyền
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, role, isLoading, user } = useAuth();
  const location = useLocation();

  // 1. Trạng thái đang tải dữ liệu từ API
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-green-600 mb-4" />
        <p className="text-slate-500 font-medium text-sm animate-pulse uppercase tracking-widest">
          Đang xác thực...
        </p>
      </div>
    );
  }

  // 2. Chưa đăng nhập: Chuyển hướng về Login và lưu lại trang hiện tại
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 3. Kiểm tra quyền truy cập (Role)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Nếu role của user không nằm trong danh sách được phép
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4. Hợp lệ: Render nội dung bên trong
  return <>{children}</>;
};

/**
 * Component dành cho các trang chỉ dành cho khách (chưa đăng nhập)
 * Ví dụ: Trang giới thiệu Marketplace cho khách
 */
export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  return <>{children}</>;
};