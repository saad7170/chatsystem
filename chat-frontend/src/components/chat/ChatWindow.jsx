import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EmptyState from '@/components/common/EmptyState';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ChatWindow() {
  const activeConversation = useChatStore((state) => state.activeConversation);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <EmptyState
          icon={ChatBubbleLeftRightIcon}
          title="Select a conversation"
          description="Choose a conversation from the sidebar to start chatting"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader conversation={activeConversation} />
      <MessageList conversationId={activeConversation._id} />
      <MessageInput conversationId={activeConversation._id} />
    </div>
  );
}
