// src/distribution.api.js

import api from "./axios";

// ======================================================
// RESPONSE HELPER
// ======================================================

const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

// ======================================================
// DISTRIBUTION API
// ======================================================

const distributionApi = {
  // ====================================================
  // DISTRIBUTE CONTENT
  // POST /distribution/:contentId
  // ====================================================

  distribute: async (contentId, payload = {}) => {
    if (!contentId) {
      throw new Error("Content ID is required");
    }

    const response = await api.post(`/distribution/${contentId}`, payload);

    return getResponseData(response);
  },

  // ====================================================
  // GET SINGLE CONTENT DISTRIBUTION SUMMARY
  // GET /distribution/:contentId
  // ====================================================

  getSummary: async (contentId) => {
    if (!contentId) {
      throw new Error("Content ID is required");
    }

    const response = await api.get(`/distribution/${contentId}`);

    return getResponseData(response);
  },

  // ====================================================
  // RETRY FAILED DISTRIBUTION TARGETS
  // POST /distribution/:contentId/retry
  // ====================================================

  retry: async (contentId, payload = {}) => {
    if (!contentId) {
      throw new Error("Content ID is required");
    }

    const response = await api.post(
      `/distribution/${contentId}/retry`,
      payload,
    );

    return getResponseData(response);
  },

  // ====================================================
  // ALL CONTENT DISTRIBUTION REPORTS
  // GET /distribution/reports
  // ====================================================

  getReports: async (params = {}) => {
    const response = await api.get("/distribution/reports", {
      params,
    });

    return getResponseData(response);
  },

  // ====================================================
  // ALIAS
  // ====================================================

  reports: async (params = {}) => {
    return distributionApi.getReports(params);
  },
};

export default distributionApi;
