import React, { createContext, useContext, useState, useEffect } from 'react';

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
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<UserProfile, 'id' | 'createdAt' | 'role'> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateRole: (role: UserRole) => void;
  setKYCVerified: (verified: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      
      // Simulate API call - replace with actual backend call
      const mockUser: UserProfile = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        phone: '',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        isKYCVerified: false,
      };

      setUser(mockUser);
      setRole('buyer');
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('role', 'buyer');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Omit<UserProfile, 'id' | 'createdAt' | 'role'> & { password: string }) => {
    try {
      setIsLoading(true);
      
      // Simulate API call - replace with actual backend call
      const newUser: UserProfile = {
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
        email: data.email,
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
