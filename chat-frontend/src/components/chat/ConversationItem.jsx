import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import Avatar from '@/components/common/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

export default function ConversationItem({ conversation, isActive, onClick }) {
  const user = useAuthStore((state) => state.user);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  // Get other participant for private chats
  const otherParticipant =
    conversation.type === 'private'
      ? conversation.participants.find((p) => p.user._id !== user._id)?.user
      : null;

  const displayName =
    conversation.type === 'private'
      ? otherParticipant?.name
      : conversation.name;

  const displayAvatar =
    conversation.type === 'private'
      ? otherParticipant?.avatar
      : conversation.avatar;

  const isOnline =
    conversation.type === 'private' &&
    otherParticipant &&
    onlineUsers.has(otherParticipant._id);

  const lastMessage = conversation.lastMessage;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 p-4 cursor-pointer border-b border-gray-200 transition-colors',
        isActive
          ? 'bg-primary-50'
          : 'hover:bg-gray-50'
      )}
    >
      <Avatar
        src={displayAvatar}
        alt={displayName}
        size="md"
        online={isOnline}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </h3>
          {lastMessage && (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(lastMessage.createdAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {lastMessage ? (
            <p className="text-sm text-gray-600 truncate">
              {lastMessage.sender?._id === user._id ? 'You: ' : ''}
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
