import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));
  },

  updateConversation: (conversationId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
    }));
  },

  removeConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.filter(
        (conv) => conv._id !== conversationId
      ),
      activeConversation:
        state.activeConversation?._id === conversationId
          ? null
          : state.activeConversation,
    }));
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
  },

  setMessages: (conversationId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    }));
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
      };
    });
  },

  updateMessage: (conversationId, messageId, updates) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: conversationMessages.map((msg) =>
            msg._id === messageId ? { ...msg, ...updates } : msg
          ),
        },
      };
    });
  },

  removeMessage: (conversationId, messageId) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: conversationMessages.filter(
            (msg) => msg._id !== messageId
          ),
        },
      };
    });
  },

  setTypingUser: (conversationId, userId, isTyping) => {
    set((state) => {
      const typingInConversation = state.typingUsers[conversationId] || new Set();
      const newTypingSet = new Set(typingInConversation);

      if (isTyping) {
        newTypingSet.add(userId);
      } else {
        newTypingSet.delete(userId);
      }

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: newTypingSet,
        },
      };
    });
  },

  setUserOnline: (userId, isOnline) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }
      return { onlineUsers: newOnlineUsers };
    });
  },

  clearChatData: () => {
    set({
      conversations: [],
      activeConversation: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),
    });
  },
}));
