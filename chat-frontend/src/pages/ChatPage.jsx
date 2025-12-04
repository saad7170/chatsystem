import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useSocketStore } from '@/store/socketStore';
import { useAuthStore } from '@/store/authStore';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import Navbar from '@/components/layout/Navbar';
import NewConversationModal from '@/components/chat/NewConversationModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function ChatPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);
  const { addMessage, updateMessage, setUserOnline, setTypingUser } = useChatStore();

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time events
    socket.on('message:receive', (message) => {
      if (message.sender._id !== user._id) {
        addMessage(message.conversation, message);
      }
    });

    socket.on('message:edited', (message) => {
      updateMessage(message.conversation, message._id, message);
    });

    socket.on('message:deleted', ({ messageId, conversationId }) => {
      updateMessage(conversationId, messageId, {
        deletedAt: new Date(),
        content: 'This message was deleted',
      });
    });

    socket.on('user:status', (data) => {
      setUserOnline(data.userId, data.status === 'online');
    });

    socket.on('typing:update', (data) => {
      if (data.userId !== user._id) {
        setTypingUser(data.conversationId, data.userId, data.isTyping);
      }
    });

    return () => {
      socket.off('message:receive');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('user:status');
      socket.off('typing:update');
    };
  }, [socket, user, addMessage, updateMessage, setUserOnline, setTypingUser]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="New Conversation"
            >
              <PlusIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <ConversationList />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </div>
      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
