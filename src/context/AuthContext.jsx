import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import authApi from "../api/auth.api";

import {
  getAccessToken,
  getUser,
  getBusiness,
  getStore,
  getSubscription,
  getPermissions,
  setAccessToken,
  setRefreshToken,
  setUser,
  setBusiness,
  setStore,
  setSubscription,
  setPermissions,
  clearAuthStorage,
} from "../utils/storage";

// ======================================================
// CONTEXT
// ======================================================

const AuthContext = createContext(null);

// ======================================================
// EXTRACT AUTH DATA
// ======================================================

const extractAuthData = (response) => {
  const root = response?.data || response || {};

  const data = root?.data || root;

  return {
    accessToken:
      data?.accessToken ||
      root?.accessToken ||
      data?.tokens?.accessToken ||
      root?.tokens?.accessToken ||
      null,

    refreshToken:
      data?.refreshToken ||
      root?.refreshToken ||
      data?.tokens?.refreshToken ||
      root?.tokens?.refreshToken ||
      null,

    user: data?.user || root?.user || null,

    business:
      data?.business || root?.business || data?.vendor || root?.vendor || null,

    store: data?.store || root?.store || null,

    subscription: data?.subscription || root?.subscription || null,

    permissions: data?.permissions || root?.permissions || null,
  };
};

// ======================================================
// PROVIDER
// ======================================================

export const AuthProvider = ({ children }) => {
  // ====================================================
  // STATE
  // ====================================================

  const [user, setUserState] = useState(() => getUser());

  const [business, setBusinessState] = useState(() => getBusiness());

  const [store, setStoreState] = useState(() => getStore());

  const [subscription, setSubscriptionState] = useState(() =>
    getSubscription(),
  );

  const [permissions, setPermissionsState] = useState(() => getPermissions());

  const [loading, setLoading] = useState(true);

  const [authLoading, setAuthLoading] = useState(false);

  // ====================================================
  // AUTHENTICATED
  // ====================================================

  const isAuthenticated = Boolean(getAccessToken()) && Boolean(user);

  // ====================================================
  // SYNC AUTH
  // ====================================================

  const syncAuthData = useCallback((response) => {
    const auth = extractAuthData(response);

    // --------------------------------------------------
    // ACCESS TOKEN
    // --------------------------------------------------

    if (auth.accessToken) {
      setAccessToken(auth.accessToken);
    }

    // --------------------------------------------------
    // REFRESH TOKEN
    // --------------------------------------------------

    if (auth.refreshToken) {
      setRefreshToken(auth.refreshToken);
    }

    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    if (auth.user) {
      setUserState(auth.user);
      setUser(auth.user);
    }

    // --------------------------------------------------
    // BUSINESS
    // --------------------------------------------------

    if (auth.business) {
      setBusinessState(auth.business);
      setBusiness(auth.business);
    }

    // --------------------------------------------------
    // STORE
    // --------------------------------------------------

    if (auth.store) {
      setStoreState(auth.store);
      setStore(auth.store);
    }

    // --------------------------------------------------
    // SUBSCRIPTION
    // --------------------------------------------------

    if (auth.subscription) {
      setSubscriptionState(auth.subscription);
      setSubscription(auth.subscription);
    }

    // --------------------------------------------------
    // PERMISSIONS
    // --------------------------------------------------

    if (auth.permissions) {
      setPermissionsState(auth.permissions);
      setPermissions(auth.permissions);
    }

    return auth;
  }, []);

  // ====================================================
  // INITIALIZE
  // ====================================================

  const initializeAuth = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();

      syncAuthData(response);
    } catch (error) {
      console.error(
        "Auth initialization failed:",
        error?.response?.data || error.message,
      );

      clearAuthStorage();

      setUserState(null);
      setBusinessState(null);
      setStoreState(null);
      setSubscriptionState(null);
      setPermissionsState(null);
    } finally {
      setLoading(false);
    }
  }, [syncAuthData]);

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ====================================================
  // LOGIN
  // ====================================================

  const login = useCallback(
    async (payload) => {
      setAuthLoading(true);

      try {
        const response = await authApi.login(payload);

        const auth = syncAuthData(response);

        if (!auth.accessToken) {
          throw new Error(
            "Login successful but access token was not returned.",
          );
        }

        if (!auth.user) {
          throw new Error("Login successful but user data was not returned.");
        }

        return {
          success: true,
          message: response?.message || "Login successful",
          data: auth,
        };
      } catch (error) {
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [syncAuthData],
  );

  // ====================================================
  // REGISTER
  // ====================================================

  const register = useCallback(
    async (payload) => {
      setAuthLoading(true);

      try {
        const response = await authApi.register(payload);

        const auth = syncAuthData(response);

        return {
          success: true,
          message: response?.message || "Registration successful",
          data: auth,
        };
      } finally {
        setAuthLoading(false);
      }
    },
    [syncAuthData],
  );

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = useCallback(async () => {
    setAuthLoading(true);

    try {
      await authApi.logout();
    } catch (error) {
      console.error(
        "Logout API error:",
        error?.response?.data || error.message,
      );
    } finally {
      clearAuthStorage();

      setUserState(null);
      setBusinessState(null);
      setStoreState(null);
      setSubscriptionState(null);
      setPermissionsState(null);

      setAuthLoading(false);
    }
  }, []);

  // ====================================================
  // REFRESH USER
  // ====================================================

  const refreshUser = useCallback(async () => {
    const response = await authApi.getMe();

    return syncAuthData(response);
  }, [syncAuthData]);

  // ====================================================
  // UPDATE PROFILE
  // ====================================================

  const updateProfile = useCallback(
    async (payload) => {
      setAuthLoading(true);

      try {
        const response = await authApi.updateProfile(payload);

        return syncAuthData(response);
      } finally {
        setAuthLoading(false);
      }
    },
    [syncAuthData],
  );

  // ====================================================
  // CHANGE PASSWORD
  // ====================================================

  const changePassword = useCallback(async (payload) => {
    setAuthLoading(true);

    try {
      return await authApi.changePassword(payload);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ====================================================
  // FORGOT PASSWORD
  // ====================================================

  const forgotPassword = useCallback(async (payload) => {
    setAuthLoading(true);

    try {
      return await authApi.forgotPassword(payload);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ====================================================
  // RESET PASSWORD
  // ====================================================

  const resetPassword = useCallback(async (payload) => {
    setAuthLoading(true);

    try {
      return await authApi.resetPassword(payload);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ====================================================
  // VERIFY EMAIL
  // ====================================================

  const verifyEmail = useCallback(async (token) => {
    return authApi.verifyEmail(token);
  }, []);

  // ====================================================
  // PERMISSION
  // ====================================================

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) {
        return true;
      }

      if (!permissions) {
        return false;
      }

      if (Array.isArray(permissions)) {
        return permissions.includes(permission);
      }

      if (typeof permissions === "object") {
        return Boolean(permissions[permission]);
      }

      return false;
    },
    [permissions],
  );

  // ====================================================
  // ROLE
  // ====================================================

  const hasRole = useCallback(
    (role) => {
      if (!user || !role) {
        return false;
      }

      const userRole =
        typeof user.role === "object"
          ? user.role?.code || user.role?.name
          : user.role;

      if (Array.isArray(role)) {
        return role.includes(userRole);
      }

      return userRole === role;
    },
    [user],
  );

  // ====================================================
  // FEATURE
  // ====================================================

  const hasFeature = useCallback(
    (feature) => {
      if (!subscription) {
        return false;
      }

      const features =
        subscription?.features || subscription?.plan?.features || [];

      if (Array.isArray(features)) {
        return features.includes(feature);
      }

      if (typeof features === "object") {
        return Boolean(features[feature]);
      }

      return false;
    },
    [subscription],
  );

  // ====================================================
  // ACTIVE SUBSCRIPTION
  // ====================================================

  const hasActiveSubscription = useMemo(() => {
    if (!subscription) {
      return false;
    }

    const status = String(subscription?.status || "").toLowerCase();

    return ["active", "trial", "trialing"].includes(status);
  }, [subscription]);

  // ====================================================
  // CONTEXT VALUE
  // ====================================================

  const value = useMemo(
    () => ({
      user,
      business,
      store,
      subscription,
      permissions,

      isAuthenticated,

      loading,
      authLoading,

      login,
      register,
      logout,

      refreshUser,
      updateProfile,

      changePassword,
      forgotPassword,
      resetPassword,

      verifyEmail,

      hasPermission,
      hasRole,

      hasFeature,
      hasActiveSubscription,

      syncAuthData,
    }),
    [
      user,
      business,
      store,
      subscription,
      permissions,

      isAuthenticated,

      loading,
      authLoading,

      login,
      register,
      logout,

      refreshUser,
      updateProfile,

      changePassword,
      forgotPassword,
      resetPassword,

      verifyEmail,

      hasPermission,
      hasRole,

      hasFeature,
      hasActiveSubscription,

      syncAuthData,
    ],
  );

  // ====================================================
  // PROVIDER
  // ====================================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ======================================================
// useAuth
// ======================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

// ======================================================
// ALIAS
// ======================================================

export const useAuthContext = useAuth;

export default AuthContext;
