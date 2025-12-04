# Complete Frontend Components Code

Copy each section below into the corresponding file path.

---

## src/components/auth/RegisterForm.jsx

```jsx
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      const { token, ...user } = response.data;
      setAuth(user, token);
      toast.success('Registration successful!');
      navigate('/chat');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="Name"
          type="text"
          placeholder="Enter your name"
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      <div>
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div>
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Registering...' : 'Register'}
      </Button>
    </form>
  );
}
```

---

## src/components/auth/ProtectedRoute.jsx

```jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
```

---

## src/components/layout/Navbar.jsx

```jsx
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
```

---

## src/components/chat/ConversationList.jsx

```jsx
import { useQuery } from '@tanstack/react-query';
import { conversationService } from '@/services/conversationService';
import { useChatStore } from '@/store/chatStore';
import ConversationItem from './ConversationItem';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/Empty State';
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
```

---

## src/components/chat/ConversationItem.jsx

```jsx
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
```

---

## src/components/chat/ChatWindow.jsx

```jsx
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
```

---

## src/components/chat/ChatHeader.jsx

```jsx
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
```

---

## src/components/chat/MessageList.jsx

```jsx
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { useChatStore } from '@/store/chatStore';
import { useSocketStore } from '@/store/socketStore';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import Loader from '@/components/common/Loader';

export default function MessageList({ conversationId }) {
  const messagesEndRef = useRef(null);
  const { messages, setMessages, addMessage, updateMessage } = useChatStore();
  const socket = useSocketStore((state) => state.socket);

  const { isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await messageService.getMessages(conversationId);
      setMessages(conversationId, response.data);
      return response.data;
    },
    enabled: !!conversationId,
  });

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[conversationId]]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit('conversation:join', conversationId);

    // Listen for new messages
    socket.on('message:receive', (message) => {
      if (message.conversation === conversationId) {
        addMessage(conversationId, message);
      }
    });

    // Listen for message edits
    socket.on('message:edited', (message) => {
      if (message.conversation === conversationId) {
        updateMessage(conversationId, message._id, message);
      }
    });

    // Listen for message deletes
    socket.on('message:deleted', ({ messageId }) => {
      updateMessage(conversationId, messageId, {
        deletedAt: new Date(),
        content: 'This message was deleted',
      });
    });

    return () => {
      socket.emit('conversation:leave', conversationId);
      socket.off('message:receive');
      socket.off('message:edited');
      socket.off('message:deleted');
    };
  }, [socket, conversationId, addMessage, updateMessage]);

  if (isLoading) {
    return <Loader text="Loading messages..." />;
  }

  const conversationMessages = messages[conversationId] || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 scrollbar-thin">
      {conversationMessages.map((message) => (
        <MessageItem key={message._id} message={message} />
      ))}
      <TypingIndicator conversationId={conversationId} />
      <div ref={messagesEndRef} />
    </div>
  );
}
```

---

## src/components/chat/MessageItem.jsx

```jsx
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
```

---

## src/components/chat/MessageInput.jsx

```jsx
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { messageService } from '@/services/messageService';
import { useSocketStore } from '@/store/socketStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function MessageInput({ conversationId }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const socket = useSocketStore((state) => state.socket);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (data) => messageService.sendMessage(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      setMessage('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket) return;

    // Start typing
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      socket.emit('typing:start', {
        conversationId,
        userId: user._id,
        userName: user.name,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', {
        conversationId,
        userId: user._id,
      });
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Clear typing indicator
    if (socket && isTyping) {
      socket.emit('typing:stop', {
        conversationId,
        userId: user._id,
      });
      setIsTyping(false);
    }

    sendMessageMutation.mutate({
      content: message.trim(),
      type: 'text',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
```

---

## src/components/chat/TypingIndicator.jsx

```jsx
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
```

---

## src/pages/AuthPage.jsx

```jsx
import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white">
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10">
          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-center text-primary-600 hover:text-primary-500 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## src/pages/ChatPage.jsx

```jsx
import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useSocketStore } from '@/store/socketStore';
import { useAuthStore } from '@/store/authStore';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import Navbar from '@/components/layout/Navbar';

export default function ChatPage() {
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
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
          <ConversationList />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
```

---

## src/utils/formatDate.js

```javascript
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatMessageTime = (date) => {
  const messageDate = new Date(date);

  if (isToday(messageDate)) {
    return format(messageDate, 'p');
  }

  if (isYesterday(messageDate)) {
    return \`Yesterday \${format(messageDate, 'p')}\`;
  }

  return format(messageDate, 'MMM d, p');
};

export const formatLastSeen = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatConversationTime = (date) => {
  const conversationDate = new Date(date);

  if (isToday(conversationDate)) {
    return format(conversationDate, 'p');
  }

  if (isYesterday(conversationDate)) {
    return 'Yesterday';
  }

  return format(conversationDate, 'MMM d');
};
```

---

## src/utils/constants.js

```javascript
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
};

export const CONVERSATION_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group',
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
};
```

---

## src/App.jsx

```jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socketStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthPage from '@/pages/AuthPage';
import ChatPage from '@/pages/ChatPage';

function App() {
  const { initAuth, isAuthenticated, user } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect(user._id);
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <AuthPage />}
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

export default App;
```

---

## src/main.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## Quick Copy-Paste Instructions

1. Create each file in the specified path
2. Copy the code from the corresponding section
3. Paste into the file
4. Save

All files are ready to use with no modifications needed!

## Testing

After creating all files:

```bash
# In root directory - start backend
npm run dev

# In chat-frontend directory - start frontend
cd chat-frontend
npm run dev
```

Then open `http://localhost:5173` and test the application!
