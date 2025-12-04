import { create } from 'zustand';
import socketService from '@/api/socket';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (userId) => {
    const socket = socketService.connect(userId);
    set({ socket, isConnected: true });
  },

  disconnect: () => {
    socketService.disconnect();
    set({ socket: null, isConnected: false });
  },

  emit: (event, data) => {
    const { socket } = get();
    if (socket) {
      socket.emit(event, data);
    }
  },

  on: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.off(event, callback);
    }
  },
}));
