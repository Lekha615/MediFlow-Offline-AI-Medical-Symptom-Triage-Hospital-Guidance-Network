import { apiClient, setStoredTokens, clearStoredTokens } from "./client";
import {
  LoginPayload,
  RegisterPayload,
  AuthSuccessData,
  User,
} from "../types/auth";
import { ApiResponse } from "../types/api";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthSuccessData> => {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>(
      "/auth/login",
      payload
    );
    if (response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      setStoredTokens(accessToken, refreshToken);
      return response.data.data;
    }
    throw new Error(response.data.message || "Login failed");
  },

  register: async (payload: RegisterPayload): Promise<AuthSuccessData> => {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>(
      "/auth/register",
      payload
    );
    if (response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      setStoredTokens(accessToken, refreshToken);
      return response.data.data;
    }
    throw new Error(response.data.message || "Registration failed");
  },

  logout: async (refreshToken: string): Promise<boolean> => {
    try {
      await apiClient.post("/auth/logout", { refreshToken });
    } catch {
      // Ignore API failure on logout
    } finally {
      clearStoredTokens();
    }
    return true;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Failed to load user profile");
  },

  /**
   * Prepared API architecture for password recovery (POST /auth/forgot-password)
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/forgot-password", { email });
      return {
        success: response.data.success,
        message: response.data.message || "Password reset instructions sent to your email address.",
      };
    } catch (err: any) {
      // If endpoint is absent on backend, throw clear informative error
      if (err.response?.status === 404) {
        throw new Error("Backend password recovery endpoint (/auth/forgot-password) is not yet active.");
      }
      throw new Error(err.response?.data?.message || err.message || "Failed to process forgot password request.");
    }
  },

  /**
   * Prepared API architecture for password reset (POST /auth/reset-password)
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/reset-password", { token, newPassword });
      return {
        success: response.data.success,
        message: response.data.message || "Password has been reset successfully.",
      };
    } catch (err: any) {
      if (err.response?.status === 404) {
        throw new Error("Backend password reset endpoint (/auth/reset-password) is not yet active.");
      }
      throw new Error(err.response?.data?.message || err.message || "Failed to reset password.");
    }
  },
};
