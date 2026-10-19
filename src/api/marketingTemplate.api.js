import api from "./axios";

// ==================================================
// MARKETING TEMPLATE API
// ==================================================

const marketingTemplateApi = {
  // ------------------------------------------------
  // GET ALL TEMPLATES
  // GET /api/marketing/templates
  // ------------------------------------------------
  getTemplates: async (params = {}) => {
    const response = await api.get("/marketing/templates", {
      params,
    });

    return response.data;
  },

  // ------------------------------------------------
  // GET SINGLE TEMPLATE
  // GET /api/marketing/templates/:id
  // ------------------------------------------------
  getTemplate: async (id) => {
    const response = await api.get(`/marketing/templates/${id}`);

    return response.data;
  },

  // ------------------------------------------------
  // CREATE TEMPLATE
  // POST /api/marketing/templates
  // ------------------------------------------------
  createTemplate: async (data) => {
    const response = await api.post("/marketing/templates", data);

    return response.data;
  },

  // ------------------------------------------------
  // UPDATE TEMPLATE
  // PUT /api/marketing/templates/:id
  // ------------------------------------------------
  updateTemplate: async (id, data) => {
    const response = await api.put(`/marketing/templates/${id}`, data);

    return response.data;
  },

  // ------------------------------------------------
  // DELETE TEMPLATE
  // DELETE /api/marketing/templates/:id
  // ------------------------------------------------
  deleteTemplate: async (id) => {
    const response = await api.delete(`/marketing/templates/${id}`);

    return response.data;
  },

  // ------------------------------------------------
  // DUPLICATE TEMPLATE
  // POST /api/marketing/templates/:id/duplicate
  // ------------------------------------------------
  duplicateTemplate: async (id) => {
    const response = await api.post(`/marketing/templates/${id}/duplicate`);

    return response.data;
  },

  // ------------------------------------------------
  // TOGGLE TEMPLATE STATUS
  // PATCH /api/marketing/templates/:id/toggle
  // ------------------------------------------------
  toggleTemplateStatus: async (id) => {
    const response = await api.patch(`/marketing/templates/${id}/toggle`);

    return response.data;
  },

  // ------------------------------------------------
  // RESTORE TEMPLATE
  // PATCH /api/marketing/templates/:id/restore
  // ------------------------------------------------
  restoreTemplate: async (id) => {
    const response = await api.patch(`/marketing/templates/${id}/restore`);

    return response.data;
  },

  // ------------------------------------------------
  // GET TEMPLATE STATS
  // GET /api/marketing/templates/:id/stats
  // ------------------------------------------------
  getTemplateStats: async (id) => {
    const response = await api.get(`/marketing/templates/${id}/stats`);

    return response.data;
  },

  // ==================================================
  // WHATSAPP
  // ==================================================

  // ------------------------------------------------
  // IMPORT WHATSAPP TEMPLATES
  // POST /api/marketing/templates/whatsapp/import
  // ------------------------------------------------
  importWhatsAppTemplates: async () => {
    const response = await api.post("/marketing/templates/whatsapp/import");

    return response.data;
  },

  // ------------------------------------------------
  // SYNC WHATSAPP TEMPLATES
  // POST /api/marketing/templates/whatsapp/sync
  // ------------------------------------------------
  syncWhatsAppTemplates: async () => {
    const response = await api.post("/marketing/templates/whatsapp/sync");

    return response.data;
  },

  uploadMediaToWhatsApp: async (payload) => {
    return api.post("/marketing/templates/upload-media", payload);
  },

  uploadTemplateMediaToWhatsApp: async (payload) => {
    return api.post("/marketing/templates/upload-template-media", payload);
  },
};

export default marketingTemplateApi;
