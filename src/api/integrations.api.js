import api from "./axios";

// ======================================================
// INTEGRATIONS API
// ======================================================
// Supported integrations:
// facebook
// instagram
// linkedin
// whatsapp
//
// Backend base route:
// /api/integrations
// ======================================================

const integrationsApi = {
  // ====================================================
  // GET ALL INTEGRATIONS
  // GET /api/integrations
  // ====================================================

  getIntegrations: async (params = {}) => {
    return api.get("/integrations", {
      params,
    });
  },

  // ====================================================
  // GET SINGLE INTEGRATION
  // GET /api/integrations/:provider
  // ====================================================

  getIntegration: async (provider) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.get(`/integrations/${provider}`);
  },

  // ====================================================
  // GET CONNECTED INTEGRATIONS
  // GET /api/integrations/connected
  // ====================================================

  getConnected: async () => {
    return api.get("/integrations/connected");
  },

  // ====================================================
  // GET AVAILABLE INTEGRATIONS
  // GET /api/integrations/available
  // ====================================================

  getAvailable: async () => {
    return api.get("/integrations/available");
  },

  // ====================================================
  // GET OAUTH / CONNECT URL
  // GET /api/integrations/:provider/connect
  //
  // Example:
  // facebook -> Facebook OAuth URL
  // instagram -> Instagram OAuth URL
  // linkedin -> LinkedIn OAuth URL
  // whatsapp -> WhatsApp OAuth URL
  // ====================================================

  getConnectUrl: async (provider) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.get(`/integrations/${provider}/connect`);
  },

  // ====================================================
  // CONNECT INTEGRATION
  // POST /api/integrations/:provider/connect
  //
  // Normally OAuth redirect is used.
  // This method can be used when backend requires
  // additional configuration/payload.
  // ====================================================

  connect: async (provider, payload = {}) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.post(`/integrations/${provider}/connect`, payload);
  },

  // ====================================================
  // DISCONNECT
  // DELETE /api/integrations/:provider
  // ====================================================

  disconnect: async (provider, integrationid) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.delete(`/integrations/${provider}/${integrationid}`);
  },

  // ====================================================
  // REFRESH / RECONNECT
  // POST /api/integrations/:provider/refresh
  // ====================================================

  refresh: async (provider) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.post(`/integrations/${provider}/refresh`);
  },

  // ====================================================
  // SYNC
  // POST /api/integrations/:provider/sync
  //
  // Useful for:
  // Facebook Pages
  // Instagram Accounts
  // LinkedIn Pages
  // WhatsApp Business Accounts
  // ====================================================

  sync: async (provider, payload = {}) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.post(`/integrations/${provider}/sync`, payload);
  },

  // ====================================================
  // GET CONNECTED ACCOUNTS / PAGES
  // GET /api/integrations/:provider/accounts
  //
  // Example:
  // Facebook -> connected Facebook Pages
  // Instagram -> connected Instagram accounts
  // LinkedIn -> connected LinkedIn pages
  // WhatsApp -> connected WhatsApp business accounts
  // ====================================================

  getAccounts: async (provider) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.get(`/integrations/${provider}/accounts`);
  },

  // ====================================================
  // SELECT / CONNECT A PAGE
  // POST /api/integrations/:provider/accounts/:accountId
  //
  // Example:
  // Facebook Page select
  // Instagram account select
  // LinkedIn page select
  // WhatsApp phone/business account select
  // ====================================================

  selectAccount: async (provider, accountId, payload = {}) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    if (!accountId) {
      throw new Error("Account ID is required.");
    }

    return api.post(`/integrations/${provider}/accounts/${accountId}`, payload);
  },

  // ====================================================
  // UPDATE INTEGRATION
  // PATCH /api/integrations/:provider
  // ====================================================

  update: async (provider, payload = {}) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.patch(`/integrations/${provider}`, payload);
  },

  // ====================================================
  // TEST CONNECTION
  // POST /api/integrations/:provider/test
  // ====================================================

  testConnection: async (provider) => {
    if (!provider) {
      throw new Error("Integration provider is required.");
    }

    return api.post(`/integrations/${provider}/test`);
  },

  // ====================================================
  // PROVIDER HELPERS
  // ====================================================

  facebook: {
    getConnectUrl: () => integrationsApi.getConnectUrl("facebook"),

    getIntegration: () => integrationsApi.getIntegration("facebook"),

    getAccounts: () => integrationsApi.getAccounts("facebook"),

    sync: (payload = {}) => integrationsApi.sync("facebook", payload),

    disconnect: () => integrationsApi.disconnect("facebook"),

    refresh: () => integrationsApi.refresh("facebook"),

    testConnection: () => integrationsApi.testConnection("facebook"),
  },

  // ====================================================

  instagram: {
    getConnectUrl: () => integrationsApi.getConnectUrl("instagram"),

    getIntegration: () => integrationsApi.getIntegration("instagram"),

    getAccounts: () => integrationsApi.getAccounts("instagram"),

    sync: (payload = {}) => integrationsApi.sync("instagram", payload),

    disconnect: () => integrationsApi.disconnect("instagram"),

    refresh: () => integrationsApi.refresh("instagram"),

    testConnection: () => integrationsApi.testConnection("instagram"),
  },

  // ====================================================

  linkedin: {
    getConnectUrl: () => integrationsApi.getConnectUrl("linkedin"),

    getIntegration: () => integrationsApi.getIntegration("linkedin"),

    getAccounts: () => integrationsApi.getAccounts("linkedin"),

    sync: (payload = {}) => integrationsApi.sync("linkedin", payload),

    disconnect: () => integrationsApi.disconnect("linkedin"),

    refresh: () => integrationsApi.refresh("linkedin"),

    testConnection: () => integrationsApi.testConnection("linkedin"),
  },

  // ====================================================

  whatsapp: {
    getConnectUrl: () => integrationsApi.getConnectUrl("whatsapp"),

    getIntegration: () => integrationsApi.getIntegration("whatsapp"),

    getAccounts: () => integrationsApi.getAccounts("whatsapp"),

    sync: (payload = {}) => integrationsApi.sync("whatsapp", payload),

    disconnect: () => integrationsApi.disconnect("whatsapp"),

    refresh: () => integrationsApi.refresh("whatsapp"),

    testConnection: () => integrationsApi.testConnection("whatsapp"),
  },
};

export default integrationsApi;
