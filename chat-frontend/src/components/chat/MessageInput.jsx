import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { messageService } from '@/services/messageService';
import { useSocketStore } from '@/store/socketStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function MessageInput({ conversationId }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const socket = useSocketStore((state) => state.socket);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (data) => messageService.sendMessage(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      setMessage('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket) return;

    // Start typing
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      socket.emit('typing:start', {
        conversationId,
        userId: user._id,
        userName: user.name,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', {
        conversationId,
        userId: user._id,
      });
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Clear typing indicator
    if (socket && isTyping) {
      socket.emit('typing:stop', {
        conversationId,
        userId: user._id,
      });
      setIsTyping(false);
    }

    sendMessageMutation.mutate({
      content: message.trim(),
      type: 'text',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
