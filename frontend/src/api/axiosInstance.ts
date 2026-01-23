import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "sonner";
import { TokenStorage } from "./tokenStorage";
import type { ApiError, RefreshResponse } from "@/types/api.types";

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/v1';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ----- Refresh Token Handling -----
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// ----- Request Interceptor -----
axiosInstance.interceptors.request.use(
  (config): any => {
    const accessToken = TokenStorage.getAccessToken();
    const url = config.url || "";
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

    // Ensure headers always exist
    config.headers = config.headers || {};

    // Standard way to add authorization header if not present
    // Skip for login/register
    if (accessToken && !config.headers.Authorization && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add userId to POST/PUT/PATCH data if available
    // Skip for auth endpoints
    const user = TokenStorage.getUser();
    if (user && user.id && !isAuthEndpoint) {
      const method = config.method?.toLowerCase();
      if (["post", "put", "patch"].includes(method || "")) {
        if (typeof config.data === 'object' && config.data !== null) {
          config.data = { ...config.data, userId: user.id };
        }
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ----- Response Interceptor -----
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const url = originalRequest.url || "";
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    // Handle 401 Unauthorized or expired JWT
    // DO NOT attempt refresh for auth endpoints (login/register)
    if (
      (error.response?.status === 401 || error.response?.data?.message === "jwt expired") &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            if (originalRequest.headers)
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = TokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await axios.post<{
          success: boolean;
          message: string;
          data: RefreshResponse;
        }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        TokenStorage.setAccessToken(accessToken);
        TokenStorage.setRefreshToken(newRefreshToken);

        onTokenRefreshed(accessToken);

        if (originalRequest.headers)
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Only clear and redirect if it's NOT a login request (which it shouldn't be here anyway due to isAuthEndpoint check)
        TokenStorage.clearTokens();
        refreshSubscribers = [];
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Only redirect on 401 for non-auth endpoints if not already handled by refresh logic
    if (error.response?.status === 401 && !isAuthEndpoint) {
      TokenStorage.clearTokens();
      window.location.href = "/";
    }

    if (error.response) {
      const message = error.response.data?.message || "Something went wrong!";
      // Don't show toast for 401s on non-auth endpoints as they redirect
      if (error.response.status !== 401 || isAuthEndpoint) {
        toast.error(message);
      }
    } else {
      toast.error("Network error. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
