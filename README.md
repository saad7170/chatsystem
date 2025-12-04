# Chat System - Real-time Chat Application Backend

A complete backend implementation for a real-time chat application built with Node.js, Express, MongoDB, and Socket.IO.

## Features

- **User Authentication** - JWT-based authentication with register/login/logout
- **Real-time Messaging** - Socket.IO for instant message delivery
- **Private & Group Chats** - Support for both private and group conversations
- **Message Features** - Send, edit, delete, and reply to messages
- **Read Receipts** - Track message read status
- **Online Status** - Real-time user presence tracking
- **Typing Indicators** - Show when users are typing
- **File Uploads** - Support for images and files via Multer/Cloudinary
- **User Profiles** - Avatar, bio, and status management

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud file storage

## Project Structure

```
chat_system/
├── config/
│   ├── db.js                 # Database connection
│   └── cloudinary.js         # Cloudinary configuration
├── models/
│   ├── User.js               # User model
│   ├── Conversation.js       # Conversation model
│   ├── Message.js            # Message model
│   └── MessageRead.js        # Message read receipts
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── conversationController.js
│   └── messageController.js
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── userRoutes.js         # User endpoints
│   ├── conversationRoutes.js
│   └── messageRoutes.js
├── middleware/
│   ├── auth.js               # JWT authentication
│   ├── errorHandler.js       # Error handling
│   └── upload.js             # File upload
├── utils/
│   ├── generateToken.js      # JWT token generator
│   └── validators.js         # Input validation
├── socket/
│   └── socketHandler.js      # Socket.IO events
├── uploads/                  # Upload directory
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── server.js                 # Main server file
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/saadahmed00413/chat_system.git
cd chat_system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Edit the `.env` file and update the following:

```env
# MongoDB - Use local or Atlas connection string
MONGODB_URI=mongodb://localhost:27017/chat-app

# JWT Secret - Change this to a strong random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL - Your frontend URL
CLIENT_URL=http://localhost:5173

# Cloudinary (optional for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### 5. Run the server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Search users | Private |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/profile` | Update profile | Private |
| PUT | `/api/users/status` | Update online status | Private |

### Conversations

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/conversations` | Get all conversations | Private |
| POST | `/api/conversations` | Create conversation | Private |
| GET | `/api/conversations/:id` | Get conversation | Private |
| DELETE | `/api/conversations/:id` | Delete conversation | Private |
| POST | `/api/conversations/:id/participants` | Add participant | Private |
| DELETE | `/api/conversations/:id/participants/:userId` | Remove participant | Private |

### Messages

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/conversations/:id/messages` | Get messages | Private |
| POST | `/api/conversations/:id/messages` | Send message | Private |
| PUT | `/api/messages/:id` | Edit message | Private |
| DELETE | `/api/messages/:id` | Delete message | Private |
| PUT | `/api/messages/:id/read` | Mark as read | Private |
| PUT | `/api/conversations/:id/read` | Mark all as read | Private |

## Socket.IO Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `user:online` | `userId` | User comes online |
| `conversation:join` | `conversationId` | Join conversation room |
| `conversation:leave` | `conversationId` | Leave conversation room |
| `message:send` | `{conversationId, senderId, content, type}` | Send message |
| `typing:start` | `{conversationId, userId, userName}` | Start typing |
| `typing:stop` | `{conversationId, userId}` | Stop typing |
| `message:read` | `{messageId, userId, conversationId}` | Mark message as read |
| `message:edit` | `{messageId, content, conversationId}` | Edit message |
| `message:delete` | `{messageId, conversationId}` | Delete message |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `user:status` | `{userId, status, socketId}` | User status changed |
| `message:receive` | `messageObject` | New message received |
| `typing:update` | `{conversationId, userId, isTyping}` | Typing indicator |
| `message:read:update` | `{messageId, userId, readAt}` | Message read receipt |
| `message:edited` | `messageObject` | Message edited |
| `message:deleted` | `{messageId, deletedAt}` | Message deleted |
| `message:error` | `{message}` | Error occurred |

## Testing with Postman

### 1. Register a User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Save the `token` from the response.

### 3. Get Users (Protected)

```http
GET http://localhost:5000/api/users
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Create Conversation

```http
POST http://localhost:5000/api/conversations
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "userId": "OTHER_USER_ID",
  "type": "private"
}
```

### 5. Send Message

```http
POST http://localhost:5000/api/conversations/CONVERSATION_ID/messages
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "content": "Hello, this is a test message!",
  "type": "text"
}
```

## Testing Socket.IO

You can test Socket.IO events using a client library or tools like:
- [Socket.IO Client Tool](https://amritb.github.io/socketio-client-tool/)
- Postman (with WebSocket support)
- Custom frontend client

Example client connection:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Connect user
socket.emit('user:online', userId);

// Join conversation
socket.emit('conversation:join', conversationId);

// Send message
socket.emit('message:send', {
  conversationId,
  senderId,
  content: 'Hello!',
  type: 'text'
});

// Listen for messages
socket.on('message:receive', (message) => {
  console.log('New message:', message);
});
```

## Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Configured for specific origins
- **Helmet.js** - Security headers
- **Input Validation** - Express-validator
- **Error Handling** - Centralized error handling

## Deployment

### Environment Setup

1. Set `NODE_ENV=production` in .env
2. Use a strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Set proper `CLIENT_URL`

### Deployment Platforms

- **Railway** - Easy deployment with MongoDB
- **Heroku** - With MongoDB Atlas
- **DigitalOcean** - VPS deployment
- **AWS/Azure** - Cloud deployment

### Database

Use **MongoDB Atlas** (free tier available) for production database.

## Future Enhancements

- [ ] Voice/Video calls
- [ ] Message reactions
- [ ] Group admin controls
- [ ] User blocking
- [ ] Message search
- [ ] Push notifications
- [ ] Rate limiting
- [ ] Redis caching
- [ ] Message encryption
- [ ] Media compression

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

## Author

Your Name - [@saadahmed00413](https://github.com/saadahmed00413)

## Support

For issues and questions, please open an issue on GitHub.
