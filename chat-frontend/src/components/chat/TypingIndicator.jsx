import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export default function TypingIndicator({ conversationId }) {
  const user = useAuthStore((state) => state.user);
  const typingUsers = useChatStore((state) => state.typingUsers);

  const typingInConversation = typingUsers[conversationId];
  const typingUserIds = typingInConversation
    ? Array.from(typingInConversation).filter((id) => id !== user._id)
    : [];

  if (typingUserIds.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-500 italic">Someone is typing...</span>
    </div>
  );
}
