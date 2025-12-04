import { useQuery } from '@tanstack/react-query';
import { conversationService } from '@/services/conversationService';
import { useChatStore } from '@/store/chatStore';
import ConversationItem from './ConversationItem';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ConversationList() {
  const { setConversations, activeConversation, setActiveConversation } =
    useChatStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await conversationService.getConversations();
      setConversations(response.data);
      return response.data;
    },
  });

  if (isLoading) {
    return <Loader text="Loading conversations..." />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load conversations
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={ChatBubbleLeftRightIcon}
        title="No conversations"
        description="Start a new conversation to get chatting!"
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {data.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          isActive={activeConversation?._id === conversation._id}
          onClick={() => setActiveConversation(conversation)}
        />
      ))}
    </div>
  );
}
