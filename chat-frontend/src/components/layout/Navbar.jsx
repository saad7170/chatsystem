import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useSocketStore } from '@/store/socketStore';
import Avatar from '@/components/common/Avatar';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { clearChatData } = useChatStore();
  const { disconnect } = useSocketStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnect();
    clearChatData();
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-600">Chat App</h1>
        </div>
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} alt={user?.name} size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{user?.name}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
