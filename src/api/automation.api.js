import api from "./axios";

const automationApi = {
  getAutomations(params = {}) {
    return api.get("/marketing/automation", {
      params,
    });
  },

  getAutomation(id) {
    return api.get(`/marketing/automation/${id}`);
  },

  createAutomation(data) {
    return api.post("/marketing/automation", data);
  },

  updateAutomation(id, data) {
    return api.put(`/marketing/automation/${id}`, data);
  },

  deleteAutomation(id) {
    return api.delete(`/marketing/automation/${id}`);
  },

  toggleAutomation(id, active) {
    return api.patch(`/marketing/automation/${id}/status`, {
      active,
    });
  },

  getUsers() {
    return api.get("/users", {
      params: {
        limit: 100,
      },
    });
  },

  getStores() {
    return api.get("/stores", {
      params: {
        limit: 100,
      },
    });
  },

  getTags() {
    return api.get("/tags", {
      params: {
        limit: 100,
      },
    });
  },
};

export default automationApi;
