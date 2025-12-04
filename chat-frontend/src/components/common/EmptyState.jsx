import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
  icon: Icon = ChatBubbleLeftRightIcon,
  title = 'No data',
  description = 'Get started by creating a new item',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Icon className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      {action && action}
    </div>
  );
}
