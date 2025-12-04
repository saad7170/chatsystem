import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { useChatStore } from '@/store/chatStore';
import { useSocketStore } from '@/store/socketStore';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import Loader from '@/components/common/Loader';

export default function MessageList({ conversationId }) {
  const messagesEndRef = useRef(null);
  const { messages, setMessages, addMessage, updateMessage } = useChatStore();
  const socket = useSocketStore((state) => state.socket);

  const { isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await messageService.getMessages(conversationId);
      setMessages(conversationId, response.data);
      return response.data;
    },
    enabled: !!conversationId,
  });

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[conversationId]]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit('conversation:join', conversationId);

    // Listen for new messages
    socket.on('message:receive', (message) => {
      if (message.conversation === conversationId) {
        addMessage(conversationId, message);
      }
    });

    // Listen for message edits
    socket.on('message:edited', (message) => {
      if (message.conversation === conversationId) {
        updateMessage(conversationId, message._id, message);
      }
    });

    // Listen for message deletes
    socket.on('message:deleted', ({ messageId }) => {
      updateMessage(conversationId, messageId, {
        deletedAt: new Date(),
        content: 'This message was deleted',
      });
    });

    return () => {
      socket.emit('conversation:leave', conversationId);
      socket.off('message:receive');
      socket.off('message:edited');
      socket.off('message:deleted');
    };
  }, [socket, conversationId, addMessage, updateMessage]);

  if (isLoading) {
    return <Loader text="Loading messages..." />;
  }

  const conversationMessages = messages[conversationId] || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 scrollbar-thin">
      {conversationMessages.map((message) => (
        <MessageItem key={message._id} message={message} />
      ))}
      <TypingIndicator conversationId={conversationId} />
      <div ref={messagesEndRef} />
    </div>
  );
}
