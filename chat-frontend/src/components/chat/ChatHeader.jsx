import { EllipsisVerticalIcon, PhoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

export default function ChatHeader({ conversation }) {
  const user = useAuthStore((state) => state.user);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

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

  const status = isOnline ? 'Online' : 'Offline';

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <Avatar src={displayAvatar} alt={displayName} size="md" online={isOnline} />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <PhoneIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <VideoCameraIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <EllipsisVerticalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
