// src/api/content.api.js

import api from "./axios";

// ======================================================
// RESPONSE HELPER
// ======================================================

const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

// ======================================================
// NORMALIZE CONTENT PAYLOAD
// ======================================================

const normalizeContentPayload = (payload = {}) => {
  const data = { ...payload };

  // ----------------------------------------------------
  // CONTENT OBJECT
  // ----------------------------------------------------

  if (data.content && typeof data.content === "object") {
    data.content = {
      ...data.content,
    };

    // Model expects secondaryKeywords as STRING
    if (Array.isArray(data.content.secondaryKeywords)) {
      data.content.secondaryKeywords = data.content.secondaryKeywords
        .map((item) => String(item).trim())
        .filter(Boolean)
        .join(", ");
    }

    // Empty publish date must be null
    if (data.content.publishDate === "") {
      data.content.publishDate = null;
    }

    // Empty publish time
    if (data.content.publishTime === undefined) {
      data.content.publishTime = "";
    }
  }

  // ----------------------------------------------------
  // TOP LEVEL SECONDARY KEYWORDS
  // ----------------------------------------------------

  if (Array.isArray(data.secondaryKeywords)) {
    data.secondaryKeywords = data.secondaryKeywords
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }

  // ----------------------------------------------------
  // REMOVE UNDEFINED
  // ----------------------------------------------------

  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });

  return data;
};

// ======================================================
// CONTENT API
// ======================================================

const contentApi = {
  // ====================================================
  // CREATE
  // POST /content
  // ====================================================

  create: async (payload = {}) => {
    const body = normalizeContentPayload(payload);

    const response = await api.post("/content", body);

    return getResponseData(response);
  },

  // ====================================================
  // GET LIST
  // GET /content
  // ====================================================

  getAll: async (params = {}) => {
    const response = await api.get("/content", {
      params,
    });

    return getResponseData(response);
  },

  // ====================================================
  // GET SINGLE
  // GET /content/:id
  // ====================================================

  getById: async (id) => {
    if (!id) {
      throw new Error("Content ID is required");
    }

    const response = await api.get(`/content/${id}`);

    return getResponseData(response);
  },

  // ====================================================
  // UPDATE
  // PUT /content/:id
  // ====================================================

  update: async (id, payload = {}) => {
    if (!id) {
      throw new Error("Content ID is required");
    }

    const body = normalizeContentPayload(payload);

    const response = await api.put(`/content/${id}`, body);

    return getResponseData(response);
  },

  // ====================================================
  // DELETE
  // DELETE /content/:id
  // ====================================================

  delete: async (id) => {
    if (!id) {
      throw new Error("Content ID is required");
    }

    const response = await api.delete(`/content/${id}`);

    return getResponseData(response);
  },

  // ====================================================
  // PUBLISH
  // POST /content/:id/publish
  // ====================================================

  publish: async (id) => {
    if (!id) {
      throw new Error("Content ID is required");
    }

    const response = await api.post(`/content/${id}/publish`);

    return getResponseData(response);
  },

  // ====================================================
  // SCHEDULE
  // POST /content/:id/schedule
  // ====================================================

  schedule: async (id, scheduledAt) => {
    if (!id) {
      throw new Error("Content ID is required");
    }

    if (!scheduledAt) {
      throw new Error("Scheduled date is required");
    }

    const response = await api.post(`/content/${id}/schedule`, {
      scheduledAt,
    });

    return getResponseData(response);
  },

  // ====================================================
  // KEYWORD RESEARCH
  // POST /content/research-keywords
  // ====================================================

  researchKeywords: async (keyword) => {
    if (!keyword?.trim()) {
      throw new Error("Keyword is required");
    }

    const response = await api.post("/content/research-keywords", {
      keyword: keyword.trim(),
    });

    return getResponseData(response);
  },

  // ====================================================
  // AI CONTENT GENERATE
  // POST /content/generate
  // ====================================================

  generateContent: async (keyword) => {
    if (!keyword?.trim()) {
      throw new Error("Keyword is required");
    }

    const response = await api.post("/content/generate", {
      keyword: keyword.trim(),
    });

    return getResponseData(response);
  },
};

export default contentApi;