import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  BUSINESS_KEY,
  STORE_KEY,
  SUBSCRIPTION_KEY,
  PERMISSIONS_KEY,
} from "../config/app.config";

// ======================================================
// SAFE STORAGE
// ======================================================

const storage = window.localStorage;

// ======================================================
// HELPERS
// ======================================================

const setJSON = (key, value) => {
  if (value === null || value === undefined) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, JSON.stringify(value));
};

const getJSON = (key, fallback = null) => {
  try {
    const value = storage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(`Storage parse error: ${key}`, error);
    storage.removeItem(key);
    return fallback;
  }
};

// ======================================================
// ACCESS TOKEN
// ======================================================

export const getAccessToken = () => {
  return storage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token) => {
  if (!token) {
    storage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  storage.setItem(ACCESS_TOKEN_KEY, token);
};

// ======================================================
// REFRESH TOKEN
// ======================================================

export const getRefreshToken = () => {
  return storage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token) => {
  if (!token) {
    storage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  storage.setItem(REFRESH_TOKEN_KEY, token);
};

// ======================================================
// USER
// ======================================================

export const getUser = () => {
  return getJSON(USER_KEY);
};

export const setUser = (user) => {
  setJSON(USER_KEY, user);
};

// ======================================================
// BUSINESS
// ======================================================

export const getBusiness = () => {
  return getJSON(BUSINESS_KEY);
};

export const setBusiness = (business) => {
  setJSON(BUSINESS_KEY, business);
};

// ======================================================
// STORE
// ======================================================

export const getStore = () => {
  return getJSON(STORE_KEY);
};

export const setStore = (store) => {
  setJSON(STORE_KEY, store);
};

// ======================================================
// SUBSCRIPTION
// ======================================================

export const getSubscription = () => {
  return getJSON(SUBSCRIPTION_KEY);
};

export const setSubscription = (subscription) => {
  setJSON(SUBSCRIPTION_KEY, subscription);
};

// ======================================================
// PERMISSIONS
// ======================================================

export const getPermissions = () => {
  return getJSON(PERMISSIONS_KEY, []);
};

export const setPermissions = (permissions) => {
  setJSON(PERMISSIONS_KEY, permissions || []);
};

// ======================================================
// SAVE COMPLETE AUTH
// ======================================================

export const saveAuth = (data = {}) => {
  const user = data.user || null;

  const accessToken = data.accessToken || data.access_token || null;

  const refreshToken = data.refreshToken || data.refresh_token || null;

  const business = data.business || user?.business || null;

  const store = data.store || user?.stores?.[0] || null;

  const subscription = data.subscription || user?.subscription || null;

  const permissions = data.permissions || user?.permissions || [];

  if (accessToken) {
    setAccessToken(accessToken);
  }

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }

  if (user) {
    setUser(user);
  }

  setBusiness(business);
  setStore(store);
  setSubscription(subscription);
  setPermissions(permissions);

  return {
    user,
    business,
    store,
    subscription,
    permissions,
    accessToken,
    refreshToken,
  };
};

// ======================================================
// CLEAR AUTH
// ======================================================

export const clearAuthStorage = () => {
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);

  storage.removeItem(USER_KEY);
  storage.removeItem(BUSINESS_KEY);
  storage.removeItem(STORE_KEY);
  storage.removeItem(SUBSCRIPTION_KEY);
  storage.removeItem(PERMISSIONS_KEY);
};

// ======================================================
// AUTH CHECK
// ======================================================

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};
