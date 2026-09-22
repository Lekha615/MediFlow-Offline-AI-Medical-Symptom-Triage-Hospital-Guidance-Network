import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthSuccessData } from "../types/auth";
import { ApiResponse } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper functions for localStorage token storage
export const getStoredAccessToken = () => localStorage.getItem("mediflow_access_token");
export const getStoredRefreshToken = () => localStorage.getItem("mediflow_refresh_token");

export const setStoredTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("mediflow_access_token", accessToken);
  localStorage.setItem("mediflow_refresh_token", refreshToken);
};

export const clearStoredTokens = () => {
  localStorage.removeItem("mediflow_access_token");
  localStorage.removeItem("mediflow_refresh_token");
};

/**
 * Diagnostic helper to format API errors cleanly
 */
export const getApiErrorMessage = (error: any): string => {
  if (!error) return "An unknown error occurred.";
  if (!error.response) {
    return "Unable to connect to MediFlow server. Please make sure the backend is running on port 5000.";
  }
  const status = error.response.status;
  const backendMsg = error.response.data?.message;

  if (status === 401) {
    return backendMsg || "Invalid email or password.";
  }
  if (status === 403) {
    return backendMsg || "You are not authorized to access this workspace.";
  }
  if (status === 404) {
    return backendMsg || "API endpoint or requested resource not found.";
  }
  if (status >= 500) {
    return backendMsg || "Internal server error on MediFlow API.";
  }
  return backendMsg || error.message || "An error occurred while communicating with the server.";
};

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple concurrent refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Auto Refresh Token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying, attempt refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        clearStoredTokens();
        isRefreshing = false;
        window.dispatchEvent(new Event("mediflow_logout"));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<ApiResponse<AuthSuccessData>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        if (data.success && data.data) {
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          setStoredTokens(accessToken, newRefreshToken);
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        clearStoredTokens();
        window.dispatchEvent(new Event("mediflow_logout"));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
