import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Cấu hình URL cơ sở từ link Railway bạn cung cấp
const API_URL = 'https://bikehub-production-2468.up.railway.app/api/v1';

export type UserRole = 'guest' | 'buyer' | 'seller' | 'inspector' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isKYCVerified?: boolean;
  token?: string; // Lưu JWT token để xác thực các request sau
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateRole: (role: UserRole) => void;
  setKYCVerified: (verified: boolean) => void;
  submitKYC: (formData: FormData) => Promise<void>; // Thêm hàm xử lý KYC
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('guest');

  // Khởi tạo trạng thái từ localStorage khi load trang
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role || 'buyer');
      } catch (error) {
        console.error('Lỗi phân giải dữ liệu người dùng:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Hàm Đăng nhập thực tế gọi API
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const userData: UserProfile = response.data; // Giả định API trả về đúng interface UserProfile
      setUser(userData);
      setRole(userData.role);
      
      // Lưu vào localStorage để duy trì phiên đăng nhập
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', userData.role);
    } catch (error: any) {
      console.error('Đăng nhập thất bại:', error);
      throw new Error(error.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Đăng ký thực tế gọi API
  const register = async (data: any) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/register`, data);
    } catch (error: any) {
      console.error('Đăng ký thất bại:', error);
      throw new Error(error.response?.data?.message || 'Không thể đăng ký tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gửi hồ sơ KYC (Xác minh danh tính)
  const submitKYC = async (formData: FormData) => {
    try {
      setIsLoading(true);
      // Gửi request kèm Token trong Header
      const response = await axios.post(`${API_URL}/users/kyc`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.status === 200) {
        setKYCVerified(true);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Gửi hồ sơ KYC thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole('guest');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    localStorage.setItem('role', newRole);
  };

  const setKYCVerified = (verified: boolean) => {
    if (user) {
      const updatedUser = { ...user, isKYCVerified: verified };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    role,
    login,
    register,
    logout,
    updateProfile,
    updateRole,
    setKYCVerified,
    submitKYC,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};