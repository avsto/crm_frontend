import api from "./axios";

// ======================================================
// AUTH API
// ======================================================

const authApi = {
  // ----------------------------------------------------
  // REGISTER
  // ----------------------------------------------------

  register: async (payload) => {
    const response = await api.post("/auth/register", payload);

    return response.data;
  },

  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------

  login: async (payload) => {
    const response = await api.post("/auth/login", payload);

    return response.data;
  },

  // ----------------------------------------------------
  // CURRENT USER
  // ----------------------------------------------------

  getMe: async () => {
    const response = await api.get("/auth/me");

    return response.data;
  },

  // ----------------------------------------------------
  // REFRESH TOKEN
  // ----------------------------------------------------

  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh", {
      refreshToken,
    });

    return response.data;
  },

  // ----------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------

  logout: async () => {
    const response = await api.post("/auth/logout");

    return response.data;
  },

  // ----------------------------------------------------
  // CHANGE PASSWORD
  // ----------------------------------------------------

  changePassword: async (payload) => {
    const response = await api.post("/auth/change-password", payload);

    return response.data;
  },

  // ----------------------------------------------------
  // FORGOT PASSWORD
  // ----------------------------------------------------

  forgotPassword: async (payload) => {
    const response = await api.post("/auth/forgot-password", payload);

    return response.data;
  },

  // ----------------------------------------------------
  // RESET PASSWORD
  // ----------------------------------------------------

  resetPassword: async (payload) => {
    const response = await api.post("/auth/reset-password", payload);

    return response.data;
  },

  // ----------------------------------------------------
  // VERIFY EMAIL
  // ----------------------------------------------------

  verifyEmail: async (token) => {
    const response = await api.post("/auth/verify-email", {
      token,
    });

    return response.data;
  },

  // ----------------------------------------------------
  // RESEND VERIFICATION
  // ----------------------------------------------------

  resendVerification: async (payload) => {
    const response = await api.post("/auth/resend-verification", payload);

    return response.data;
  },

  // ----------------------------------------------------
  // UPDATE PROFILE
  // ----------------------------------------------------

  updateProfile: async (payload) => {
    const response = await api.put("/auth/profile", payload);

    return response.data;
  },
};

export default authApi;
