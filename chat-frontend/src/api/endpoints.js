export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  GET_ME: '/auth/me',

  // Users
  GET_USERS: '/users',
  GET_USER: (id) => `/users/${id}`,
  UPDATE_PROFILE: '/users/profile',
  UPDATE_STATUS: '/users/status',

  // Conversations
  GET_CONVERSATIONS: '/conversations',
  CREATE_CONVERSATION: '/conversations',
  GET_CONVERSATION: (id) => `/conversations/${id}`,
  DELETE_CONVERSATION: (id) => `/conversations/${id}`,
  ADD_PARTICIPANT: (id) => `/conversations/${id}/participants`,
  REMOVE_PARTICIPANT: (id, userId) => `/conversations/${id}/participants/${userId}`,

  // Messages
  GET_MESSAGES: (conversationId) => `/conversations/${conversationId}/messages`,
  SEND_MESSAGE: (conversationId) => `/conversations/${conversationId}/messages`,
  EDIT_MESSAGE: (id) => `/messages/${id}`,
  DELETE_MESSAGE: (id) => `/messages/${id}`,
  MARK_AS_READ: (id) => `/messages/${id}/read`,
  MARK_CONVERSATION_READ: (conversationId) => `/conversations/${conversationId}/read`,
};
