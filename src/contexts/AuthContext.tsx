import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

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
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<UserProfile, 'id' | 'createdAt' | 'role'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateRole: (role: UserRole) => void;
  setKYCVerified: (verified: boolean) => void;
  getMyInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [role, setRole] = useState<UserRole>('guest');

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role') as UserRole;
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role || storedRole || 'buyer');
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        username: email, 
        password: password,
      });

      const { code, message, result } = response.data;

      if (code !== 1000) {
        throw new Error(message || 'Login failed');
      }

      const { token, authenticated } = result;

      if (!authenticated || !token) {
        throw new Error('Authentication failed');
      }

      // Store token
      localStorage.setItem('token', token);

      // Fetch user info after successful login
      await getMyInfo();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getMyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(API_ENDPOINTS.GET_MY_INFO, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { code, message, result } = response.data;

      if (code !== 1000) {
        throw new Error(message || 'Failed to fetch user info');
      }

      // Assuming result is the user object
      const userData: UserProfile = {
        id: result.id,
        email: result.username, 
        name: result.name,
        phone: '', 
        role: result.roles?.[0]?.name?.toLowerCase() || 'buyer', 
        createdAt: new Date().toISOString(),
        isKYCVerified: result.verified || false,
      };

      setUser(userData);
      setRole(userData.role);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', userData.role);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw error;
    }
  };

  const register = async (data: Omit<UserProfile, 'id' | 'createdAt' | 'role'> & { password: string }) => {
    try {
      setIsLoading(true);
      
      // Simulate API call - replace with actual backend call
      const _newUser: UserProfile = {
        id: 'user_' + Date.now(),
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: 'buyer',
        createdAt: new Date().toISOString(),
        isKYCVerified: false,
      };

      // Store registration data but don't auto-login
      // User must go to login page with their credentials
      localStorage.setItem('registeredUser', JSON.stringify({
        email: _newUser.email,
        // Note: Never store passwords in localStorage in production
        // This is for demo only
      }));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(API_ENDPOINTS.LOGOUT, {
          token: token,
        });
      }
    } catch (error) {
      console.error('Logout API failed:', error);
      // Continue with local logout even if API fails
    } finally {
      setUser(null);
      setRole('guest');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      setIsLoggingOut(false);
    }
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token to refresh');
      }

      const response = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, {
        token: token,
      });

      const { code, message, result } = response.data;

      if (code !== 0) {
        throw new Error(message || 'Token refresh failed');
      }

      const { token: newToken, authenticated } = result;

      if (!authenticated || !newToken) {
        throw new Error('Refresh failed');
      }

      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout
      await logout();
      throw error;
    }
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
    isLoggingOut,
    role,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    updateRole,
    setKYCVerified,
    getMyInfo,
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
