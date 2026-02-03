import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Sử dụng instance đã cấu hình

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
  token?: string; 
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
  submitKYC: (formData: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('guest');

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

  // Gọi API Login thông qua instance api
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Endpoint khớp với Swagger /api/v1/auth/login
      const response = await api.post('/api/v1/auth/login', { email, password });
      
      const userData: UserProfile = response.data; 
      setUser(userData);
      setRole(userData.role);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', userData.role);
    } catch (error: any) {
      console.error('Đăng nhập thất bại:', error);
      throw new Error(error.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API Register thông qua instance api
  const register = async (data: any) => {
    try {
      setIsLoading(true);
      // Endpoint khớp với Swagger /api/v1/auth/register
      await api.post('/api/v1/auth/register', data);
    } catch (error: any) {
      console.error('Đăng ký thất bại:', error);
      throw new Error(error.response?.data?.message || 'Không thể đăng ký tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const submitKYC = async (formData: FormData) => {
    try {
      setIsLoading(true);
      // Instance api đã có interceptor tự thêm Token nếu user đã login
      const response = await api.post('/api/v1/users/kyc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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