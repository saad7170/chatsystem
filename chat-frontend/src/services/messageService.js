import axios from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';

export const messageService = {
  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await axios.get(ENDPOINTS.GET_MESSAGES(conversationId), {
      params: { page, limit },
    });
    return response.data;
  },

  sendMessage: async (conversationId, data) => {
    const response = await axios.post(
      ENDPOINTS.SEND_MESSAGE(conversationId),
      data
    );
    return response.data;
  },

  editMessage: async (messageId, content) => {
    const response = await axios.put(ENDPOINTS.EDIT_MESSAGE(messageId), {
      content,
    });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await axios.delete(ENDPOINTS.DELETE_MESSAGE(messageId));
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await axios.put(ENDPOINTS.MARK_AS_READ(messageId));
    return response.data;
  },

  markConversationAsRead: async (conversationId) => {
    const response = await axios.put(
      ENDPOINTS.MARK_CONVERSATION_READ(conversationId)
    );
    return response.data;
  },
};
