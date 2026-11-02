import api from "./axios";

const automationApi = {
  // ==========================================
  // CREATE AUTOMATION
  // POST /api/automations
  // ==========================================
  create: async (payload) => {
    const response = await api.post("/automations", payload);
    return response.data;
  },

  // ==========================================
  // GET ALL AUTOMATIONS
  // GET /api/automations
  // ==========================================
  getAll: async (params = {}) => {
    const response = await api.get("/automations", { params });
    return response.data;
  },

  // ==========================================
  // GET SINGLE AUTOMATION
  // GET /api/automations/:id
  // ==========================================
  getById: async (id) => {
    const response = await api.get(`/automations/${id}`);
    return response.data;
  },

  // ==========================================
  // UPDATE AUTOMATION
  // PUT /api/automations/:id
  // ==========================================
  update: async (id, payload) => {
    const response = await api.put(`/automations/${id}`, payload);
    return response.data;
  },

  // ==========================================
  // DELETE AUTOMATION
  // DELETE /api/automations/:id
  // ==========================================
  delete: async (id) => {
    const response = await api.delete(`/automations/${id}`);
    return response.data;
  },

  // ==========================================
  // UPDATE STATUS
  // PATCH /api/automations/:id/status
  // ==========================================
  updateStatus: async (id, status) => {
    const response = await api.patch(`/automations/${id}/status`, {
      status,
    });

    return response.data;
  },

  // ==========================================
  // ACTIVATE AUTOMATION
  // ==========================================
  activate: async (id) => {
    return automationApi.updateStatus(id, "active");
  },

  // ==========================================
  // PAUSE AUTOMATION
  // ==========================================
  pause: async (id) => {
    return automationApi.updateStatus(id, "paused");
  },

  // ==========================================
  // ARCHIVE AUTOMATION
  // ==========================================
  archive: async (id) => {
    return automationApi.updateStatus(id, "archived");
  },

  // ==========================================
  // EXECUTION HISTORY
  // GET /api/automations/executions/history
  // ==========================================
  getExecutionHistory: async (params = {}) => {
    const response = await api.get("/automations/executions/history", {
      params,
    });

    return response.data;
  },

  // ==========================================
  // GET SINGLE EXECUTION
  // GET /api/automations/executions/:id
  // ==========================================
  getExecutionById: async (id) => {
    const response = await api.get(`/automations/executions/${id}`);

    return response.data;
  },

  // ==========================================
  // RETRY FAILED EXECUTION
  // POST /api/automations/executions/:id/retry
  // ==========================================
  retryExecution: async (id) => {
    const response = await api.post(`/automations/executions/${id}/retry`);

    return response.data;
  },
};

export default automationApi;
