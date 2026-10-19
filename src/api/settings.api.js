import api from "./axios";

const settingsApi = {
  getEmailSettings: () => api.get("/settings/email"),

  updateEmailSettings: (data) => api.put("/settings/email", data),

  testEmailSettings: (data) => api.post("/settings/email/test", data),
};

export default settingsApi;
