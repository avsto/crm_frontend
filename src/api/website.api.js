import api from "./axios";

// ======================================================
// WEBSITE API
// ======================================================

const websiteApi = {
  // ====================================================
  // WEBSITE LIST
  // GET /api/websites
  // ====================================================
  getWebsiteProducts: (websiteId) => {
    return api.get(`/websites/${websiteId}/products`);
  },
  // ----------------------------------------------------
  // PREVIEW WEBSITE
  // ----------------------------------------------------
  getPreviewWebsite: (slug) => {
    return api.get(`/websites/preview/${slug}`);
  },
  getWebsites: async (params = {}) => {
    return api.get("/websites", {
      params,
    });
  },

  // ====================================================
  // WEBSITE SUMMARY
  // GET /api/websites/summary
  // ====================================================

  getSummary: async () => {
    return api.get("/websites/summary");
  },

  // ====================================================
  // GET SINGLE WEBSITE
  // GET /api/websites/:websiteId
  // ====================================================

  getWebsite: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}`);
  },

  // ====================================================
  // CREATE WEBSITE
  // POST /api/websites
  // ====================================================

  createWebsite: async (payload) => {
    return api.post("/websites", payload);
  },

  // ====================================================
  // UPDATE WEBSITE
  // PUT /api/websites/:websiteId
  // ====================================================

  updateWebsite: async (websiteId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.put(`/websites/${websiteId}`, payload);
  },

  // ====================================================
  // DELETE WEBSITE
  // DELETE /api/websites/:websiteId
  // ====================================================

  deleteWebsite: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.delete(`/websites/${websiteId}`);
  },

  // ====================================================
  // PUBLISH
  // POST /api/websites/:websiteId/publish
  // ====================================================

  publishWebsite: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.post(`/websites/${websiteId}/publish`);
  },

  // ====================================================
  // UNPUBLISH
  // POST /api/websites/:websiteId/unpublish
  // ====================================================

  unpublishWebsite: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.post(`/websites/${websiteId}/unpublish`);
  },

  // ====================================================
  // DUPLICATE
  // POST /api/websites/:websiteId/duplicate
  // ====================================================

  duplicateWebsite: async (websiteId, payload = {}) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.post(`/websites/${websiteId}/duplicate`, payload);
  },

  // ====================================================
  // PAGES
  // ====================================================

  // GET /api/websites/:websiteId/pages
  getPages: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/pages`);
  },

  // GET /api/websites/:websiteId/pages/:pageId
  getPage: async (websiteId, pageId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    if (!pageId) {
      throw new Error("Page ID is required.");
    }

    return api.get(`/websites/${websiteId}/pages/${pageId}`);
  },

  // POST /api/websites/:websiteId/pages
  createPage: async (websiteId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.post(`/websites/${websiteId}/pages`, payload);
  },

  // PUT /api/websites/:websiteId/pages/:pageId
  updatePage: async (websiteId, pageId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    if (!pageId) {
      throw new Error("Page ID is required.");
    }

    return api.put(`/websites/${websiteId}/pages/${pageId}`, payload);
  },

  // DELETE /api/websites/:websiteId/pages/:pageId
  deletePage: async (websiteId, pageId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    if (!pageId) {
      throw new Error("Page ID is required.");
    }

    return api.delete(`/websites/${websiteId}/pages/${pageId}`);
  },

  // ====================================================
  // THEME
  // ====================================================

  // GET /api/website-themes
  getThemes: async () => {
    return api.get("/websites/themes");
  },

  // GET /api/websites/:websiteId/theme
  getWebsiteTheme: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/theme`);
  },

  // POST /api/websites/:websiteId/theme/apply
  applyTheme: async (websiteId, themeId, themeName = "") => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    if (!themeId) {
      throw new Error("Theme ID is required.");
    }

    return api.post(`/websites/${websiteId}/theme/apply`, {
      themeId,
      ...(themeName ? { themeName } : {}),
    });
  },

  // PUT /api/websites/:websiteId/theme
  updateWebsiteTheme: async (websiteId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.put(`/websites/${websiteId}/theme`, payload);
  },

  // ====================================================
  // DOMAIN
  // ====================================================

  // GET /api/websites/:websiteId/domains
  getDomains: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/domains`);
  },

  // GET /api/websites/:websiteId/domain
  getDomain: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/domain`);
  },

  // POST /api/websites/:websiteId/domain
  connectDomain: async (websiteId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.post(`/websites/${websiteId}/domain`, payload);
  },

  // POST /api/websites/:websiteId/domain/:domainId/verify
  verifyDomain: async (websiteId, domainId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    if (!domainId) {
      throw new Error("Domain ID is required.");
    }

    return api.post(`/websites/${websiteId}/domain/${domainId}/verify`);
  },

  // POST /api/websites/:websiteId/domain/:domainId/primary
  setPrimaryDomain: async (websiteId, domainId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    if (!domainId) {
      throw new Error("Domain ID is required.");
    }

    return api.post(`/websites/${websiteId}/domain/${domainId}/primary`);
  },

  // DELETE /api/websites/:websiteId/domain/:domainId
  disconnectDomain: async (websiteId, domainId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    if (!domainId) {
      throw new Error("Domain ID is required.");
    }

    return api.delete(`/websites/${websiteId}/domain/${domainId}`);
  },

  // ====================================================
  // NAVIGATION
  // ====================================================

  // GET /api/websites/:websiteId/navigation
  getNavigation: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/navigation`);
  },

  // PUT /api/websites/:websiteId/navigation
  updateNavigation: async (websiteId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.put(`/websites/${websiteId}/navigation`, payload);
  },

  // ====================================================
  // SEO
  // ====================================================

  // GET /api/websites/:websiteId/seo
  getSEO: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/seo`);
  },

  // PUT /api/websites/:websiteId/seo
  updateSEO: async (websiteId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.put(`/websites/${websiteId}/seo`, payload);
  },

  // ====================================================
  // SETTINGS
  // ====================================================

  // GET /api/websites/:websiteId/settings
  getSettings: async (websiteId) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/settings`);
  },

  // PUT /api/websites/:websiteId/settings
  updateSettings: async (websiteId, payload) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.put(`/websites/${websiteId}/settings`, payload);
  },

  // ====================================================
  // ANALYTICS
  // ====================================================

  getAnalytics: async (websiteId, params = {}) => {
    if (!websiteId) {
      throw new Error("Website ID is required.");
    }

    return api.get(`/websites/${websiteId}/analytics`, {
      params,
    });
  },
};

export default websiteApi;
