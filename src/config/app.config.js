// ======================================================
// APP CONFIG
// ======================================================

const appConfig = {
  // API
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",

  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || "Brielix",

  // Environment
  NODE_ENV: import.meta.env.MODE || "development",

  // Auth
  ACCESS_TOKEN_KEY:
    import.meta.env.VITE_ACCESS_TOKEN_KEY || "avstomart_access_token",

  REFRESH_TOKEN_KEY:
    import.meta.env.VITE_REFRESH_TOKEN_KEY || "avstomart_refresh_token",

  // Storage
  USER_KEY: "avstomart_user",
  BUSINESS_KEY: "avstomart_business",
  STORE_KEY: "avstomart_store",
  SUBSCRIPTION_KEY: "avstomart_subscription",
  PERMISSIONS_KEY: "avstomart_permissions",
};

// ======================================================
// NAMED EXPORTS
// ======================================================

export const API_BASE_URL = appConfig.API_BASE_URL;

export const APP_NAME = appConfig.APP_NAME;

export const NODE_ENV = appConfig.NODE_ENV;

export const ACCESS_TOKEN_KEY = appConfig.ACCESS_TOKEN_KEY;

export const REFRESH_TOKEN_KEY = appConfig.REFRESH_TOKEN_KEY;

export const USER_KEY = appConfig.USER_KEY;

export const BUSINESS_KEY = appConfig.BUSINESS_KEY;

export const STORE_KEY = appConfig.STORE_KEY;

export const SUBSCRIPTION_KEY = appConfig.SUBSCRIPTION_KEY;

export const PERMISSIONS_KEY = appConfig.PERMISSIONS_KEY;

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default appConfig;
