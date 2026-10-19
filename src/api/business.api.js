import api from "./axios";

const businessApi = {
  getBusiness: async () => {
    const response = await api.get("/business");
    return response.data;
  },

  createBusiness: async (data) => {
    const response = await api.post("/business", data);

    return response.data;
  },

  updateBusiness: async (data) => {
    const response = await api.put("/business", data);

    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/business/profile");

    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/business/profile", data);

    return response.data;
  },

  getSummary: async () => {
    const response = await api.get("/business/summary");

    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/business/stats");

    return response.data;
  },

  deleteBusiness: async () => {
    const response = await api.delete("/business");

    return response.data;
  },

  // Create Razorpay subscription
  createRazorpaySubscription: async (data) => {
    const response = await api.post(
      "/business/subscription/razorpay/create",
      data,
    );

    return response.data;
  },

  // Verify Razorpay subscription/payment
  verifyRazorpaySubscription: async (data) => {
    const response = await api.post(
      "/business/subscription/razorpay/verify",
      data,
    );

    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (data = {}) => {
    const response = await api.post("/business/subscription/cancel", data);

    return response.data;
  },
};

export default businessApi;
