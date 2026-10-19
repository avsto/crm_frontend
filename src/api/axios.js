import axios from "axios";

import {
  API_BASE_URL,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../config/app.config";

import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthStorage,
} from "../utils/storage";

// ======================================================
// AXIOS INSTANCE
// ======================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ======================================================
// REFRESH STATE
// ======================================================

let isRefreshing = false;

let refreshSubscribers = [];

// ======================================================
// SUBSCRIBE
// ======================================================

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// ======================================================
// NOTIFY
// ======================================================

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => {
    callback(token);
  });

  refreshSubscribers = [];
};

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    // Don't attach access token to auth endpoints
    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/refresh") ||
      config.url?.includes("/auth/forgot-password") ||
      config.url?.includes("/auth/reset-password") ||
      config.url?.includes("/auth/verify-email");

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // No response
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // ==================================================
    // ONLY HANDLE 401
    // ==================================================

    if (status !== 401) {
      return Promise.reject(error);
    }

    // ==================================================
    // NEVER REFRESH THESE ENDPOINTS
    // ==================================================

    const url = originalRequest?.url || "";

    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password") ||
      url.includes("/auth/verify-email");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // ==================================================
    // PREVENT INFINITE LOOP
    // ==================================================

    if (originalRequest._retry) {
      clearAuthStorage();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // ==================================================
    // GET REFRESH TOKEN
    // ==================================================

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthStorage();

      return Promise.reject(error);
    }

    // ==================================================
    // REFRESH ALREADY RUNNING
    // ==================================================

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;

          resolve(api(originalRequest));
        });
      });
    }

    // ==================================================
    // START REFRESH
    // ==================================================

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {
          refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const data = response?.data?.data || response?.data || {};

      const newAccessToken =
        data.accessToken || data.access_token || response?.data?.accessToken;

      const newRefreshToken =
        data.refreshToken || data.refresh_token || response?.data?.refreshToken;

      // ==================================================
      // REFRESH FAILED
      // ==================================================

      if (!newAccessToken) {
        clearAuthStorage();

        onRefreshed(null);

        return Promise.reject(error);
      }

      // ==================================================
      // SAVE TOKENS
      // ==================================================

      setAccessToken(newAccessToken);

      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      // ==================================================
      // UPDATE WAITING REQUESTS
      // ==================================================

      onRefreshed(newAccessToken);

      // ==================================================
      // RETRY ORIGINAL REQUEST
      // ==================================================

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.error(
        "Token refresh failed:",
        refreshError?.response?.data || refreshError?.message,
      );

      clearAuthStorage();

      onRefreshed(null);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ======================================================
// EXPORT
// ======================================================

export default api;
