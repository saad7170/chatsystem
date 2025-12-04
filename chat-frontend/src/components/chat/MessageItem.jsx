import { format } from 'date-fns';
import clsx from 'clsx';
import Avatar from '@/components/common/Avatar';
import { useAuthStore } from '@/store/authStore';
import { CheckIcon } from '@heroicons/react/24/outline';
import { CheckCheckIcon } from 'lucide-react';

export default function MessageItem({ message }) {
  const user = useAuthStore((state) => state.user);
  const isOwn = message.sender._id === user._id;

  const isRead = message.readBy && message.readBy.length > 1;

  return (
    <div
      className={clsx(
        'flex gap-2 chat-message-animate',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isOwn && (
        <Avatar src={message.sender.avatar} alt={message.sender.name} size="sm" />
      )}

      <div
        className={clsx(
          'flex flex-col max-w-[70%]',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {!isOwn && (
          <span className="text-xs text-gray-600 mb-1">
            {message.sender.name}
          </span>
        )}

        <div
          className={clsx(
            'px-4 py-2 rounded-lg',
            isOwn
              ? 'bg-primary-600 text-white rounded-tr-none'
              : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
          )}
        >
          {message.isEdited && (
            <span className="text-xs opacity-70 italic">(edited)</span>
          )}
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), 'p')}
          </span>
          {isOwn && (
            <span className="text-xs">
              {isRead ? (
                <CheckCheckIcon className="w-3 h-3 text-blue-500" />
              ) : (
                <CheckIcon className="w-3 h-3 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
