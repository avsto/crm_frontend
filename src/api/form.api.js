import api from "./axios";

const formApi = {
  // ==================================================
  // GET ALL FORMS
  // ==================================================

  getForms: async (params = {}) => {
    const response = await api.get("/forms", {
      params,
    });

    return response.data;
  },

  // ==================================================
  // GET SINGLE FORM
  // ==================================================

  getForm: async (id) => {
    const response = await api.get(`/forms/${id}`);

    return response.data;
  },

  // ==================================================
  // CREATE FORM
  // ==================================================

  createForm: async (data) => {
    const response = await api.post("/forms", data);

    return response.data;
  },

  // ==================================================
  // UPDATE FORM
  // ==================================================

  updateForm: async (id, data) => {
    const response = await api.put(`/forms/${id}`, data);

    return response.data;
  },

  // ==================================================
  // DELETE FORM
  // ==================================================

  deleteForm: async (id) => {
    const response = await api.delete(`/forms/${id}`);

    return response.data;
  },
};

export default formApi;
