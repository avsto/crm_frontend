import api from "./axios";

const teamApi = {
  // ======================================================
  // GET TEAM MEMBERS
  // ======================================================

  getTeamMembers: async (params = {}) => {
    const response = await api.get("/team", {
      params,
    });

    return response.data;
  },

  // ======================================================
  // GET SINGLE TEAM MEMBER
  // ======================================================

  getTeamMember: async (id) => {
    const response = await api.get(`/team/${id}`);

    return response.data;
  },

  // ======================================================
  // CREATE TEAM MEMBER
  // ======================================================

  createTeamMember: async (data) => {
    const response = await api.post("/team", data);

    return response.data;
  },

  // ======================================================
  // UPDATE TEAM MEMBER
  // ======================================================

  updateTeamMember: async (id, data) => {
    const response = await api.put(`/team/${id}`, data);

    return response.data;
  },

  // ======================================================
  // DELETE TEAM MEMBER
  // ======================================================

  deleteTeamMember: async (id) => {
    const response = await api.delete(`/team/${id}`);

    return response.data;
  },

  // ======================================================
  // RESTORE TEAM MEMBER
  // ======================================================

  restoreTeamMember: async (id) => {
    const response = await api.patch(`/team/${id}/restore`);

    return response.data;
  },
};

export default teamApi;
