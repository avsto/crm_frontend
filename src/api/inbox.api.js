import api from "./axios";

const inboxApi = {
  getOrCreateConversation(phone) {
    return api.get("/inbox/getOrCreateConversation/" + phone);
  },
  getConversations(params = {}) {
    return api.get("/inbox/conversations", {
      params,
    });
  },

  getMessages(conversationId, params = {}) {
    return api.get(`/inbox/conversations/${conversationId}/messages`, {
      params,
    });
  },

  sendMessage(conversationId, data) {
    return api.post(`/inbox/conversations/${conversationId}/messages`, data);
  },

  markAsRead(conversationId) {
    return api.patch(`/inbox/conversations/${conversationId}/read`);
  },

  toggleStar(conversationId, starred) {
    return api.patch(`/inbox/conversations/${conversationId}/star`, {
      starred,
    });
  },

  archiveConversation(conversationId) {
    return api.patch(`/inbox/conversations/${conversationId}/archive`);
  },

  unarchiveConversation(conversationId) {
    return api.patch(`/inbox/conversations/${conversationId}/unarchive`);
  },

  assignConversation(conversationId, assignedTo) {
    return api.patch(`/inbox/conversations/${conversationId}/assign`, {
      assignedTo,
    });
  },

  addTag(conversationId, tag) {
    return api.post(`/inbox/conversations/${conversationId}/tags`, {
      tag,
    });
  },

  removeTag(conversationId, tag) {
    return api.delete(`/inbox/conversations/${conversationId}/tags`, {
      data: {
        tag,
      },
    });
  },

  getSummary() {
    return api.get("/inbox/summary");
  },

  getEmailsync() {
    return api.get("/webhooks/email/sync");
  },
};

export default inboxApi;
