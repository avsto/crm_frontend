import api from "./axios";

const crmApi = {
  // ====================================================
  // LEADS
  // ====================================================

  // Get all leads
  getLeads: (params = {}) => api.get("/crm/leads", { params }),

  // Get single lead
  getLead: (id) => api.get(`/crm/leads/${id}`),

  // Get lead conversations
  getConversations: (data) => api.post("/crm/leads/conversation", data),

  // Create lead
  createLead: (data) => api.post("/crm/leads", data),

  // Update lead
  updateLead: (id, data) => api.put(`/crm/leads/${id}`, data),

  // Delete lead
  deleteLead: (id) => api.delete(`/crm/leads/${id}`),

  // ====================================================
  // LEAD STATUS
  // ====================================================

  updateLeadStatus: (id, data) => api.patch(`/crm/leads/${id}/status`, data),

  // ====================================================
  // LEAD ACTIVITIES
  // ====================================================

  addLeadActivity: (id, data) => api.post(`/crm/leads/${id}/activities`, data),

  // ====================================================
  // LEAD ASSIGNMENT
  // ====================================================

  assignLead: (id, data) => api.patch(`/crm/leads/${id}/assign`, data),

  // ====================================================
  // IMPORT LEADS
  // ====================================================

  importLeads: (formData) =>
    api.post("/crm/leads/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ====================================================
  // OPPORTUNITIES
  // ====================================================

  // Get all opportunities
  getOpportunities: (params = {}) => api.get("/crm/opportunities", { params }),

  // Get single opportunity
  getOpportunity: (id) => api.get(`/crm/opportunities/${id}`),

  // Create opportunity
  createOpportunity: (data) => api.post("/crm/opportunities", data),

  // Update opportunity
  updateOpportunity: (id, data) => api.put(`/crm/opportunities/${id}`, data),

  // Delete opportunity
  deleteOpportunity: (id) => api.delete(`/crm/opportunities/${id}`),

  // ====================================================
  // OPPORTUNITY STAGE
  // ====================================================

  updateOpportunityStage: (id, data) =>
    api.patch(`/crm/opportunities/${id}/stage`, data),

  // ====================================================
  // TAGS
  // ====================================================

  // Get all tags
  getTags: (params = {}) => api.get("/crm/tags", { params }),

  // Get single tag
  getTag: (id) => api.get(`/crm/tags/${id}`),

  // Create tag
  createTag: (data) => api.post("/crm/tags", data),

  // Update tag
  updateTag: (id, data) => api.put(`/crm/tags/${id}`, data),

  // Delete tag
  deleteTag: (id) => api.delete(`/crm/tags/${id}`),

  // ====================================================
  // DEALS
  // ====================================================

  // Get all deals
  getDeals: (params = {}) => api.get("/crm/deals", { params }),

  // Get single deal
  getDeal: (id) => api.get(`/crm/deals/${id}`),

  // Create deal
  createDeal: (data) => api.post("/crm/deals", data),

  // Update deal
  updateDeal: (id, data) => api.put(`/crm/deals/${id}`, data),

  // Update deal stage
  updateDealStage: (id, data) => api.patch(`/crm/deals/${id}/stage`, data),

  // Delete deal
  deleteDeal: (id) => api.delete(`/crm/deals/${id}`),

  // ====================================================
  // CUSTOMERS
  // ====================================================

  // Get all customers (search, filters, pagination)
  getCustomers: (params = {}) => api.get("/crm/customers", { params }),

  // Get single customer
  getCustomer: (id) => api.get(`/crm/customers/${id}`),

  // Create customer
  createCustomer: (data) => api.post("/crm/customers", data),

  // Update customer
  updateCustomer: (id, data) => api.put(`/crm/customers/${id}`, data),

  // Delete customer
  deleteCustomer: (id) => api.delete(`/crm/customers/${id}`),

  // ====================================================
  // CUSTOMER STATUS
  // ====================================================

  updateCustomerStatus: (id, data) => api.patch(`/crm/customers/${id}/status`, data),
  // ====================================================
  // CUSTOMER ACTIVITIES
  // ====================================================

  addCustomerActivity: (id, data) => api.post(`/crm/customers/${id}/activities`, data),
};

export default crmApi;
