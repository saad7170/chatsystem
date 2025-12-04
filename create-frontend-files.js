const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'chat-frontend', 'src');

const files = {
  // Auth Components
  'components/auth/LoginForm.jsx': `import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { token, ...user } = response.data;
      setAuth(user, token);
      toast.success('Login successful!');
      navigate('/chat');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}`,

  'components/auth/RegisterForm.jsx': `import { useNavigate } from 'react-router-dom';
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
}`,

  'components/auth/ProtectedRoute.jsx': `import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}`,

  // Utility functions
  'utils/formatDate.js': `import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

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
};`,

  'utils/constants.js': `export const MESSAGE_TYPES = {
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
};`,

  // Main App.jsx
  'App.jsx': `import { useEffect } from 'react';
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

export default App;`,

  // Pages
  'pages/AuthPage.jsx': `import { useState } from 'react';
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
}`,

'pages/ChatPage.jsx': `import { useEffect } from 'react';
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
          <ConversationList />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}`,
};

// Create files
Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(baseDir, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content);
  console.log(\`Created: \${filePath}\`);
});

console.log('All files created successfully!');
