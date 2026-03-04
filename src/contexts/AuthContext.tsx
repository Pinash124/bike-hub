import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export type UserRole = "guest" | "buyer" | "seller" | "inspector" | "admin";

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
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<string>;
  register: (data: {
    password: string;
    verificationToken: string;
    fullName: string;
    role: "buyer" | "seller";
  }) => Promise<void>;
  uploadKYC: (
    front: File,
    back: File,
  ) => Promise<{ draftId: string; kyc: any }>;
  confirmKYC: (draftId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateRole: (role: UserRole) => void;
  setKYCVerified: (verified: boolean) => void;
  getMyInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role") as UserRole;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role || storedRole || "buyer");
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // NOTE: Do NOT touch global isLoading here — it's only for initial auth init.
    // Touching it here causes ProtectedRoute to flash/redirect mid-login.
    const response = await axios.post(API_ENDPOINTS.LOGIN, {
      username: email,
      password: password,
    });

    const { code, message, result } = response.data;

    if (code !== 1000) {
      throw new Error(message || "Login failed");
    }

    const { token, authenticated } = result;

    if (!authenticated || !token) {
      throw new Error("Authentication failed");
    }

    // Store token
    localStorage.setItem("token", token);

    // Fetch user info after successful login
    await getMyInfo();
  };

  const sendOTP = async (email: string) => {
    try {
      const response = await axios.post(API_ENDPOINTS.SEND_OTP, { email });
      const { code, message } = response.data;
      if (code !== 1000) {
        throw new Error(message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Send OTP failed:", error);
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<string> => {
    try {
      const response = await axios.post(API_ENDPOINTS.VERIFY_OTP, {
        email,
        otp,
      });
      const { code, message, result } = response.data;

      if (code !== 1000) {
        throw new Error(message || "Invalid OTP");
      }

      return result.verificationToken;
    } catch (error: any) {
      console.error("Verify OTP failed:", error);
      throw new Error(error.response?.data?.message || "Invalid OTP");
    }
  };

  const getMyInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(API_ENDPOINTS.GET_MY_INFO, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { code, message, result } = response.data;

      if (code !== 1000) {
        throw new Error(message || "Failed to fetch user info");
      }

      // Extract role - handle both singular 'role' and 'roles' array
      let extractedRole = "buyer"; // default

      if (result.role) {
        extractedRole = String(result.role).toLowerCase();
      } else if (
        result.roles &&
        Array.isArray(result.roles) &&
        result.roles.length > 0
      ) {
        const roleName = result.roles[0]?.name || result.roles[0];
        extractedRole = String(roleName).toLowerCase();
      }

      // Validate role is one of the allowed values
      const validRoles = ["guest", "buyer", "seller", "inspector", "admin"];
      if (!validRoles.includes(extractedRole as UserRole)) {
        console.warn(
          `Invalid role received: ${extractedRole}, defaulting to buyer`,
        );
        extractedRole = "buyer";
      }

      const userData: UserProfile = {
        id: result.id,
        email: result.username || result.email || "",
        name: result.fullName || result.name || "",
        phone: result.phone || "",
        role: extractedRole as UserRole,
        createdAt: result.createdAt || new Date().toISOString(),
        isKYCVerified: result.verified || false,
      };

      console.log("User authenticated:", { ...userData, email: "***" }); // Debug log

      setUser(userData);
      setRole(userData.role);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", userData.role);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      // Clear auth data on failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setUser(null);
      setRole("guest");
      throw error;
    }
  };

  const register = async (data: {
    password: string;
    verificationToken: string;
    fullName: string;
    role: "buyer" | "seller";
  }) => {
    try {
      const payload = {
        verificationToken: data.verificationToken,
        password: data.password,
        fullName: data.fullName,
        role: data.role === "buyer" ? "BUYER" : "SELLER",
      };

      const response = await axios.post(API_ENDPOINTS.REGISTRATION, payload);
      const { code, message, result } = response.data;
      if (code !== 1000) {
        throw new Error(message || "Registration failed");
      }

      // Registration successful: backend handled creation. Do not auto-login.
      console.log("Registration successful", result);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const uploadKYC = async (
    front: File,
    back: File,
  ): Promise<{ draftId: string; kyc: any }> => {
    try {
      const formData = new FormData();
      formData.append("front", front);
      formData.append("back", back);

      const token = localStorage.getItem("token");
      const response = await axios.post(API_ENDPOINTS.UPLOAD_KYC, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const { code, message, result } = response.data;
      if (code !== 1000) {
        throw new Error(message || "Upload KYC failed");
      }

      return result; // Expected to contain { draftId, kyc: {...} }
    } catch (error: any) {
      console.error("Upload KYC failed:", error);
      throw new Error(error.response?.data?.message || "Upload KYC failed");
    }
  };

  const confirmKYC = async (draftId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        API_ENDPOINTS.CONFIRM_KYC,
        { draftId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { code, message } = response.data;
      if (code !== 1000) {
        throw new Error(message || "Confirm KYC failed");
      }

      // Update local user state if successful
      setKYCVerified(false); // Likely pending approval, or true if auto-approved. Safest to assume pending or re-fetch my-info.
      await getMyInfo();
    } catch (error: any) {
      console.error("Confirm KYC failed:", error);
      throw new Error(error.response?.data?.message || "Confirm KYC failed");
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(API_ENDPOINTS.LOGOUT, {
          token: token,
        });
      }
    } catch (error) {
      console.error("Logout API failed:", error);
      // Continue with local logout even if API fails
    } finally {
      setUser(null);
      setRole("guest");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      setIsLoggingOut(false);
    }
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token to refresh");
      }

      const response = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, {
        token: token,
      });

      const { code, message, result } = response.data;

      if (code !== 1000) {
        throw new Error(message || "Token refresh failed");
      }

      const { token: newToken, authenticated } = result;

      if (!authenticated || !newToken) {
        throw new Error("Refresh failed");
      }

      localStorage.setItem("token", newToken);
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout
      await logout();
      throw error;
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    localStorage.setItem("role", newRole);
  };

  const setKYCVerified = (verified: boolean) => {
    if (user) {
      const updatedUser = { ...user, isKYCVerified: verified };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
    sendOTP,
    verifyOTP,
    uploadKYC,
    confirmKYC,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
