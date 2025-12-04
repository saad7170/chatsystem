import axios from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';

export const conversationService = {
  getConversations: async () => {
    const response = await axios.get(ENDPOINTS.GET_CONVERSATIONS);
    return response.data;
  },

  createConversation: async (data) => {
    const response = await axios.post(ENDPOINTS.CREATE_CONVERSATION, data);
    return response.data;
  },

  getConversation: async (id) => {
    const response = await axios.get(ENDPOINTS.GET_CONVERSATION(id));
    return response.data;
  },

  deleteConversation: async (id) => {
    const response = await axios.delete(ENDPOINTS.DELETE_CONVERSATION(id));
    return response.data;
  },

  addParticipant: async (conversationId, userId) => {
    const response = await axios.post(
      ENDPOINTS.ADD_PARTICIPANT(conversationId),
      { userId }
    );
    return response.data;
  },

  removeParticipant: async (conversationId, userId) => {
    const response = await axios.delete(
      ENDPOINTS.REMOVE_PARTICIPANT(conversationId, userId)
    );
    return response.data;
  },
};
