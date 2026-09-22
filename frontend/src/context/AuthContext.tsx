import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, LoginPayload, RegisterPayload, RoleName } from "../types/auth";
import { authApi } from "../api/authApi";
import { getStoredAccessToken, getStoredRefreshToken, clearStoredTokens } from "../api/client";

interface AuthContextType {
  user: User | null;
  role: RoleName | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      setUser(null);
      clearStoredTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    // Global listener for automatic logout on unresolvable 401
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener("mediflow_logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("mediflow_logout", handleLogoutEvent);
    };
  }, [fetchCurrentUser]);

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const authData = await authApi.login(payload);
      setUser(authData.user);
      return authData.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const authData = await authApi.register(payload);
      setUser(authData.user);
      return authData.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      } else {
        clearStoredTokens();
      }
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  const role = (typeof user?.role === "string" ? user.role : user?.role?.name) || null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
