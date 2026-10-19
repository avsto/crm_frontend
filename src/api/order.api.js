// src/api/order.api.js

import api from "./axios";

// ======================================================
// RESPONSE HELPER
// ======================================================

const getResponseData = (response) => {
  return response?.data;
};

// ======================================================
// ORDER API
// ======================================================

const orderApi = {
  // ====================================================
  // GET ORDERS
  // ====================================================

  getOrders: async (params = {}) => {
    const response = await api.get("/orders", {
      params,
    });

    return getResponseData(response);
  },

  // ====================================================
  // GET SINGLE ORDER
  // ====================================================

  getOrder: async (id) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.get(`/orders/${id}`);

    return getResponseData(response);
  },

  // ====================================================
  // CREATE ORDER
  // ====================================================

  createOrder: async (payload) => {
    if (!payload) {
      throw new Error("Order data is required");
    }

    const response = await api.post("/orders", payload);

    return getResponseData(response);
  },

  // ====================================================
  // UPDATE ORDER
  // ====================================================

  updateOrder: async (id, payload) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    if (!payload) {
      throw new Error("Order data is required");
    }

    const response = await api.put(`/orders/${id}`, payload);

    return getResponseData(response);
  },

  // ====================================================
  // UPDATE ORDER STATUS
  // ====================================================

  updateOrderStatus: async (id, status) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}/status`, {
      status,
    });

    return getResponseData(response);
  },

  // ====================================================
  // UPDATE PAYMENT STATUS
  // ====================================================

  updatePaymentStatus: async (id, paymentStatus) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      paymentStatus,
    });

    return getResponseData(response);
  },

  // ====================================================
  // UPDATE DELIVERY
  // ====================================================

  updateDelivery: async (id, delivery) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      delivery,
    });

    return getResponseData(response);
  },

  // ====================================================
  // UPDATE TRACKING
  // ====================================================

  updateTracking: async (
    id,
    {
      trackingNumber = "",
      trackingUrl = "",
      courierName = "",
      courierService = "",
    } = {},
  ) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      delivery: {
        trackingNumber,
        trackingUrl,
        courierName,
        courierService,
      },
    });

    return getResponseData(response);
  },

  // ====================================================
  // MARK AS SHIPPED
  // ====================================================

  markAsShipped: async (
    id,
    {
      trackingNumber = "",
      trackingUrl = "",
      courierName = "",
      courierService = "",
    } = {},
  ) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      status: "processing",

      delivery: {
        status: "shipped",
        trackingNumber,
        trackingUrl,
        courierName,
        courierService,
      },
    });

    return getResponseData(response);
  },

  // ====================================================
  // OUT FOR DELIVERY
  // ====================================================

  markOutForDelivery: async (id) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      delivery: {
        status: "out_for_delivery",
      },
    });

    return getResponseData(response);
  },

  // ====================================================
  // MARK DELIVERED
  // ====================================================

  markDelivered: async (id) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      delivery: {
        status: "delivered",
      },
    });

    return getResponseData(response);
  },

  // ====================================================
  // DELIVERY FAILED
  // ====================================================

  markDeliveryFailed: async (id, failureReason = "") => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      delivery: {
        status: "failed",
        failureReason,
      },
    });

    return getResponseData(response);
  },

  // ====================================================
  // RETURN ORDER
  // ====================================================

  markReturned: async (id, returnReason = "") => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      delivery: {
        status: "returned",
        returnReason,
      },
    });

    return getResponseData(response);
  },

  // ====================================================
  // CANCEL ORDER
  // ====================================================

  cancelOrder: async (id, cancellationReason = "") => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${id}`, {
      status: "cancelled",
      cancellationReason,
      delivery: {
        status: "cancelled",
      },
    });

    return getResponseData(response);
  },

  // ====================================================
  // DELETE ORDER
  // ====================================================

  deleteOrder: async (id) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const response = await api.delete(`/orders/${id}`);

    return getResponseData(response);
  },
};

export default orderApi;
