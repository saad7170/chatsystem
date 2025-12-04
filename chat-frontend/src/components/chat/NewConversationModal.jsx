import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { conversationService } from '@/services/conversationService';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

export default function NewConversationModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [conversationType, setConversationType] = useState('private'); // 'private' or 'group'
  const [groupName, setGroupName] = useState('');

  const currentUser = useAuthStore((state) => state.user);
  const { setActiveConversation, addConversation } = useChatStore();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      const response = await userService.getUsers(searchTerm);
      // Filter out current user
      return response.data.filter((user) => user._id !== currentUser._id);
    },
    enabled: isOpen,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await conversationService.createConversation(data);
      return response.data;
    },
    onSuccess: (conversation) => {
      addConversation(conversation);
      setActiveConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation created!');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create conversation');
    },
  });

  const handleUserSelect = (user) => {
    if (conversationType === 'private') {
      setSelectedUsers([user]);
    } else {
      // Group conversation - allow multiple selections
      const isSelected = selectedUsers.some((u) => u._id === user._id);
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (conversationType === 'group' && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    let data;

    if (conversationType === 'private') {
      // For private conversations, send userId (single user)
      data = {
        type: 'private',
        userId: selectedUsers[0]._id,
      };
    } else {
      // For group conversations, send participantIds (array) and name
      data = {
        type: 'group',
        name: groupName.trim(),
        participantIds: selectedUsers.map((u) => u._id),
      };
    }

    createConversationMutation.mutate(data);
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchTerm('');
    setGroupName('');
    setConversationType('private');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Conversation</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Conversation Type Selection */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setConversationType('private');
                setSelectedUsers([]);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                conversationType === 'private'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Private Chat
            </button>
            <button
              onClick={() => {
                setConversationType('group');
                setSelectedUsers([]);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                conversationType === 'group'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Group Chat
            </button>
          </div>
        </div>

        {/* Group Name Input (only for group conversations) */}
        {conversationType === 'group' && (
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Selected Users Display (for group) */}
        {conversationType === 'group' && selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user._id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                >
                  {user.name}
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="hover:text-blue-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <Loader text="Loading users..." />
          ) : users?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="space-y-2">
              {users?.map((user) => {
                const isSelected = selectedUsers.some((u) => u._id === user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-12 h-12 text-gray-400" />
                    )}
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-400 truncate">{user.bio}</p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={
              selectedUsers.length === 0 ||
              createConversationMutation.isPending ||
              (conversationType === 'group' && !groupName.trim())
            }
            className="flex-1"
          >
            {createConversationMutation.isPending
              ? 'Creating...'
              : conversationType === 'private'
              ? 'Start Chat'
              : 'Create Group'}
          </Button>
        </div>
      </div>
    </div>
  );
}
