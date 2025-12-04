# React Chat Application Frontend - Implementation Guide

## Status
The frontend project has been set up with the following completed:

### ✅ Completed
1. Vite React project created
2. All dependencies installed (React Router, Zustand, React Query, Socket.IO, Tailwind, etc.)
3. Vite configuration with path aliases and proxy
4. Tailwind CSS configured with custom theme
5. API configuration (axios, socket, endpoints)
6. Zustand stores (auth, chat, socket, UI)
7. API services (auth, user, conversation, message)
8. Common components (Button, Input, Avatar, Loader, EmptyState)
9. LoginForm component

### 🚧 Remaining Files to Create

Follow these steps to complete the implementation:

## Step 1: Create Remaining Auth Components

### 1.1 RegisterForm.jsx
```bash
cd chat-frontend/src/components/auth
```

Create `RegisterForm.jsx` with registration logic similar to LoginForm but with name and confirmPassword fields.

### 1.2 ProtectedRoute.jsx
```jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}
```

## Step 2: Create Chat Components

### 2.1 ConversationList.jsx
- Query conversations using React Query
- Map through conversations and render ConversationItem components
- Handle loading and empty states

### 2.2 ConversationItem.jsx
- Display conversation avatar, name, last message
- Show online status for private chats
- Handle click to set active conversation

### 2.3 ChatWindow.jsx
- Check if activeConversation exists
- Render ChatHeader, MessageList, and MessageInput

### 2.4 ChatHeader.jsx
- Display conversation/user info
- Show online status
- Action buttons (call, video, menu)

### 2.5 MessageList.jsx
- Fetch messages using React Query
- Listen to socket events for new messages
- Scroll to bottom on new messages
- Render MessageItem components

### 2.6 MessageItem.jsx
- Display message with sender info
- Different styling for own vs received messages
- Show timestamp and read status

### 2.7 MessageInput.jsx
- Textarea for message input
- Handle typing indicators via socket
- Send message mutation
- File upload button (optional)

### 2.8 TypingIndicator.jsx
- Show when other users are typing
- Get typing users from chat store

## Step 3: Create Layout Components

### 3.1 Navbar.jsx
```jsx
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/common/Avatar';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-600">Chat App</h1>
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} alt={user?.name} size="sm" />
          <span className="text-sm font-medium">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
```

## Step 4: Create Pages

### 4.1 AuthPage.jsx
- Toggle between LoginForm and RegisterForm
- Nice styling with gradient background

### 4.2 ChatPage.jsx
- Setup socket event listeners
- Render Navbar, ConversationList, ChatWindow
- Handle real-time updates

## Step 5: Create Utils

### 5.1 formatDate.js
```javascript
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatMessageTime = (date) => {
  const messageDate = new Date(date);
  if (isToday(messageDate)) return format(messageDate, 'p');
  if (isYesterday(messageDate)) return `Yesterday ${format(messageDate, 'p')}`;
  return format(messageDate, 'MMM d, p');
};
```

### 5.2 constants.js
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
```

## Step 6: Update Main Files

### 6.1 main.jsx
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
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

### 6.2 App.jsx
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
    return () => disconnect();
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
    </Routes>
  );
}

export default App;
```

## Step 7: Quick Implementation Commands

To speed up development, you can copy component code from the comprehensive guide document provided earlier.

Each component follows the same pattern:
1. Import dependencies
2. Use hooks (useQuery, useMutation, useStore)
3. Handle events
4. Render UI

## Step 8: Testing

1. Start backend server:
```bash
cd .. # Go back to root
npm run dev
```

2. Start frontend:
```bash
cd chat-frontend
npm run dev
```

3. Open `http://localhost:5173`
4. Register a new user
5. Login and start chatting

## Key Integration Points

### Socket.IO Events to Handle
- `message:receive` - New message
- `message:edited` - Message edited
- `message:deleted` - Message deleted
- `user:status` - User online/offline
- `typing:update` - Typing indicator

### React Query Keys
- `['conversations']` - All conversations
- `['messages', conversationId]` - Messages for conversation
- `['users']` - All users
- `['user', userId]` - Specific user

### Zustand Store Usage
```javascript
// Auth
const { user, isAuthenticated, setAuth, logout } = useAuthStore();

// Chat
const { conversations, activeConversation, messages, setActiveConversation, addMessage } = useChatStore();

// Socket
const { socket, connect, disconnect, emit } = useSocketStore();

// UI
const { isSidebarOpen, toggleSidebar } = useUIStore();
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure backend allows `http://localhost:5173`
2. **Socket Not Connecting**: Check VITE_SOCKET_URL in .env
3. **401 Errors**: Token not being sent - check axios interceptor
4. **Messages Not Updating**: Join conversation room via socket first

### Debug Checklist
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ .env file configured correctly
- ✅ MongoDB connected
- ✅ Socket.IO CORS configured
- ✅ User logged in and token in localStorage

## Next Steps

1. Complete all remaining component files
2. Test registration and login
3. Test real-time messaging
4. Add file upload functionality
5. Add group chat features
6. Improve UI/UX
7. Add message reactions
8. Add read receipts UI
9. Add user profile editing
10. Deploy to production

## Resources

- React Query: https://tanstack.com/query/latest
- Zustand: https://zustand-demo.pmnd.rs/
- Socket.IO Client: https://socket.io/docs/v4/client-api/
- Tailwind CSS: https://tailwindcss.com/docs
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/

---

Good luck with your implementation! The foundation is solid, now it's just a matter of creating the remaining components following the patterns established.
