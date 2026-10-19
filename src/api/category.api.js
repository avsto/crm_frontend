import api from "./axios";

const categoryApi = {
  getCategories: async (params = {}) => {
    const response = await api.get(`/categories`, {
      params,
    });

    return response.data;
  },

  getCategoryTree: async () => {
    const response = await api.get(`/categories/tree`);

    return response.data;
  },

  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);

    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post(`/categories`, data);

    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);

    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);

    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/categories/${id}/status`);

    return response.data;
  },
};

export default categoryApi;
